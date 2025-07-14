const express = require('express');
const axios = require('axios');
const qs = require('qs'); // ✅ Librería para codificar como x-www-form-urlencoded
const app = express();

app.use(express.json());

// Token y URL de Zoho
const VERIFY_TOKEN = 'zoho2025';
const ZOHO_FUNCTION_URL = 'https://www.zohoapis.com/crm/v7/functions/whatsapp_handler_v2/actions/execute?auth_type=apikey&zapikey=1003.03b63b6e4e623744f73f7fffbddb4902.8699f916ad4a321667d278b4e23182c4';

// Validación de webhook Meta (GET)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verificado con Meta');
    res.status(200).send(challenge);
  } else {
    console.warn('❌ Verificación fallida');
    res.sendStatus(403);
  }
});

// Recepción de mensajes WhatsApp (POST)
app.post('/webhook', async (req, res) => {
  try {
    console.log('📥 Payload recibido:', JSON.stringify(req.body));

    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const firstMessage = value?.messages?.[0];

    const numero = firstMessage?.from || '';
    const mensaje = firstMessage?.text?.body || '';

    console.log("🧪 Número extraído:", numero);
    console.log("🧪 Mensaje extraído:", mensaje);

    // Validar que haya datos antes de enviar a Zoho
    if (!numero || !mensaje) {
      console.warn("⚠️ Número o mensaje vacío, no se envía a Zoho");
      return res.sendStatus(400);
    }

    // Convertir a x-www-form-urlencoded
    const params = qs.stringify({ numero, mensaje });

    console.log("📤 Enviando a Zoho:", params);

    const zohoResponse = await axios.post(ZOHO_FUNCTION_URL, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    console.log("✅ Respuesta de Zoho:", zohoResponse.data);

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error enviando a Zoho:", error.message);
    res.sendStatus(500);
  }
});

// 🚀 Iniciar servidor en Render
const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
