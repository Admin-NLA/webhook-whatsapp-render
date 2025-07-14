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

// ✅ Manejo de mensajes entrantes desde WhatsApp
app.post('/webhook', async (req, res) => {
  try {
    console.log("📥 Payload recibido:", JSON.stringify(req.body));

    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    const numero = message?.from || "";
    const mensaje = message?.text?.body || "";
    const json_payload = JSON.stringify(req.body);

    console.log("🧪 Número extraído:", numero);
    console.log("🧪 Mensaje extraído:", mensaje);

    if (!numero || !mensaje) {
      console.warn("⚠️ Número o mensaje vacíos.");
      return res.sendStatus(400);
    }

    // ✅ Codificar los parámetros en formato x-www-form-urlencoded
    const params = qs.stringify({
      numero,
      mensaje,
      json_payload
    });

    console.log("📤 Enviando a Zoho:", params);

    const response = await axios.post(ZOHO_FUNCTION_URL, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log("✅ Respuesta de Zoho:", response.data);
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.sendStatus(500);
  }
});

// 🚀 Iniciar servidor en Render
const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
