const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Configuración
const VERIFY_TOKEN = 'zoho2025';
const ZOHO_FUNCTION_URL = 'https://www.zohoapis.com/crm/v7/functions/whatsapp_standalone/actions/execute?auth_type=apikey&zapikey=1003.b22046226a141976ea4c8a51cf8eb73e.f16aa9a4d222d6064995247bdd2bfd7c';

// RUTA para verificar webhook de Meta (GET)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verificado con Meta');
    return res.status(200).send(challenge);
  } else {
    console.warn('❌ Verificación fallida');
    return res.sendStatus(403);
  }
});

// RUTA para procesar mensajes entrantes (POST)
app.post('/webhook', async (req, res) => {
  try {
    // Extraer datos del body (según payload WhatsApp)
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    if (!value?.messages || !value.messages[0]) {
      console.warn("⚠️ No hay mensajes en el payload, ignorando");
      return res.sendStatus(200);
    }

    const message = value.messages[0];
    const numero = message.from || "";
    let mensaje = "";

    if (message?.text?.body) {
      mensaje = message.text.body;
    } else if (message?.type === "image" && message?.image?.caption) {
      mensaje = message.image.caption;
    } else if (message?.type === "image") {
      mensaje = "[Imagen recibida]";
    } else if (message?.type === "audio") {
      mensaje = "[Audio recibido]";
    } else if (message?.type === "video") {
      mensaje = "[Video recibido]";
    } else if (message?.type === "sticker") {
      mensaje = "[Sticker recibido]";
    } else if (message?.type === "button") {
      mensaje = `[Botón presionado: ${message.button.text}]`;
    } else if (message?.type === "interactive") {
      mensaje = `[Interacción: ${JSON.stringify(message.interactive)}]`;
    } else {
      mensaje = `[Tipo desconocido: ${message?.type || "sin tipo"}]`;
    }

    // Validar datos
    if (!numero || !mensaje) {
      console.warn("⚠️ Número o mensaje vacíos");
      return res.sendStatus(400);
    }

    // Construir payload para Zoho
    const payload = {
      numero,
      mensaje,
      json_payload: JSON.stringify(req.body)
    };

    console.log("📤 Enviando a Zoho:", payload);

    // Llamar función Zoho con axios POST JSON
    const response = await axios.post(ZOHO_FUNCTION_URL, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log("✅ Respuesta Zoho:", response.data);

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error procesando webhook:", error.message);
    res.status(500).send("Error interno");
  }
});

const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
