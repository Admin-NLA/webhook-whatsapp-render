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
    console.log('📥 Recibido:', JSON.stringify(body));

   // 👇 Extraer valores del JSO
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const firstMessage = messages?.[0];

    const numero = firstMessage?.from;
    const mensaje = firstMessage?.text?.body;

    // ✅ Mostrar en consola
    console.log("📞 Número:", numero);
    console.log("💬 Mensaje:", mensaje);
    // 🚫 Si número o mensaje son undefined, llegarán como null a Zoho

    // ✅ Construir URLSearchParams
    const params = new URLSearchParams();
    params.append("numero", numero || "");
    params.append("mensaje", mensaje || "");

    console.log('📤 Enviando a Zoho...');
    
    const zohoResponse = await axios.post(ZOHO_FUNCTION_URL, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
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
