const express = require('express');
const axios = require('axios');
const qs = require('qs');  // ✅ Para codificar como x-www-form-urlencoded
const app = express();

app.use(express.json());

// Token y URL de Zoho
const VERIFY_TOKEN = 'zoho2025';
const ZOHO_FUNCTION_URL = 'https://www.zohoapis.com/crm/v7/functions/whatsapp_handler_v2/actions/execute?auth_type=apikey&zapikey=1003.7ac01f6d1f55de25633046b3881a02ed.3936bae7c6809a39aded361220909e9b';

// ✅ Validación del Webhook de Meta
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verificado');
    res.status(200).send(challenge);
  } else {
    console.warn('❌ Verificación fallida');
    res.sendStatus(403);
  }
});

// ✅ Procesamiento de mensajes entrantes de WhatsApp
app.post('/webhook', async (req, res) => {
  try {
    console.log("📥 Payload recibido:", JSON.stringify(req.body, null, 2));

    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    const numero = message?.from || "";
    let mensaje = "";

    // 🔍 Lógica robusta para tipos de mensaje
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
    } else {
      mensaje = `[${message?.type || "mensaje no reconocido"} recibido]`;
    }

    const json_payload = JSON.stringify(req.body);

    console.log("🧪 Número extraído:", numero);
    console.log("🧪 Mensaje extraído:", mensaje);

    if (!numero || !mensaje) {
      console.warn("⚠️ Número o mensaje vacíos.");
      return res.sendStatus(400);
    }

    const params = qs.stringify({ numero, mensaje, json_payload });

    const response = await axios.post(ZOHO_FUNCTION_URL, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    console.log("✅ Enviado a Zoho:", response.data);
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Error procesando webhook:", err.message);
    res.sendStatus(500);
  }
});

// 🚀 Iniciar servidor en Render
const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
