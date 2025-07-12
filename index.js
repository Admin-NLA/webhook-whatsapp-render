const express = require('express');
const axios = require('axios');
const qs = require('qs');
const app = express();

app.use(express.json());

// Token y URL de Zoho
const VERIFY_TOKEN = 'zoho2025';
const ZOHO_FUNCTION_URL = 'https://www.zohoapis.com/crm/v7/functions/whatsapp_handler_v2/actions/execute?auth_type=apikey&zapikey=1003.03b63b6e4e623744f73f7fffbddb4902.8699f916ad4a321667d278b4e23182c4';

// ✅ Validación del webhook de Meta
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

// ✅ Recepción de mensajes entrantes de WhatsApp
app.post('/webhook', async (req, res) => {
  try {
    console.log('📥 Payload recibido:', JSON.stringify(req.body));

    // Extraer número y mensaje desde estructura de WhatsApp
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const firstMessage = value?.messages?.[0];

    const numero = firstMessage?.from || "";
    const mensaje = firstMessage?.text?.body || "";

    console.log("🧪 Número extraído:", numero);
    console.log("🧪 Mensaje extraído:", mensaje);

    // Validar antes de enviar
    if (!numero || !mensaje) {
      console.warn("⚠️ Número o mensaje vacíos, no se enviará a Zoho.");
      return res.sendStatus(400);
    }

    // Convertir a formato x-www-form-urlencoded
    const params = qs.stringify({ numero, mensaje });

    console.log("📤 Payload a Zoho:", params);

    // Enviar a Zoho
    const zohoResponse = await axios.post(ZOHO_FUNCTION_URL, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
