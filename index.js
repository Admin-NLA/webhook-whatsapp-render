const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// Tu token de verificación de Meta (WhatsApp)
const VERIFY_TOKEN = 'zoho2025';

// URL de tu función publicada en Zoho CRM
const ZOHO_FUNCTION_URL = 'https://www.zohoapis.com/crm/v7/functions/webhook_whatsapp_handler_1/actions/execute?auth_type=apikey&zapikey=1003.86443ae1903577068c825f1956224904.fe30eed22599ca84828f4e87f25b7449';

// 🔐 Verificación del Webhook (GET) para Meta
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verificado por Meta');
    res.status(200).send(challenge);
  } else {
    console.warn('❌ Verificación fallida');
    res.sendStatus(403);
  }
});

// 📩 Recepción de mensajes de WhatsApp (POST)
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;
    console.log('📥 Recibido:', JSON.stringify(body));

    // Extraer número y mensaje
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const messageData = value?.messages?.[0];

    const numero = messageData?.from || null;
    const mensaje = messageData?.text?.body || null;

    console.log("📞 Número:", numero);
    console.log("💬 Mensaje:", mensaje);

    if (!numero || !mensaje) {
      console.warn("⚠️ No se pudo extraer número o mensaje del webhook.");
      return res.sendStatus(400);
    }

    // Enviar a función de Zoho CRM
    const zohoResponse = await axios.post(ZOHO_FUNCTION_URL, {
      numero: numero,
      mensaje: mensaje
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Enviado a Zoho:', zohoResponse.data);
    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error enviando a Zoho:', error.message);
    res.sendStatus(500);
  }
});

// 🚀 Iniciar servidor en Render
const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
