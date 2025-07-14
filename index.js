const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Configuración
const VERIFY_TOKEN = 'zoho2025';
const ZOHO_FUNCTION_URL = 'https://www.zohoapis.com/crm/v7/functions/whatsapp_standalone/actions/execute?auth_type=apikey&zapikey=1003.b22046226a141976ea4c8a51cf8eb73e.f16aa9a4d222d6064995247bdd2bfd7c';

// Verificación webhook Meta
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

// Procesar mensajes entrantes
app.post('/webhook', async (req, res) => {
  try {
    console.log("📥 Payload recibido:", JSON.stringify(req.body, null, 2));

    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    if (!value?.messages || !value.messages[0]) {
      console.warn("⚠️ No se encontró value.messages[0], ignorando evento.");
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

    console.log("🧪 Número extraído:", numero);
    console.log("🧪 Mensaje extraído:", mensaje);

    if (!numero || !mensaje) {
      console.warn("⚠️ Número o mensaje vacíos. No se enviará a Zoho.");
      return res.sendStatus(400);
    }

    // Prepara payload JSON para Zoho standalone (content-type: application/json)
    const payload = {
      numero,
      mensaje,
      json_payload: JSON.stringify(req.body),
    };

    console.log("📤 Payload que se enviará a Zoho (JSON):", JSON.stringify(payload));

    const response = await axios.post(ZOHO_FUNCTION_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log("✅ Enviado a Zoho:", response.data);
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Error procesando webhook:", err.message);
    res.status(500).send(`Error interno: ${err.message}`);
  }
});

const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
