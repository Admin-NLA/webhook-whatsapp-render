const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const VERIFY_TOKEN = 'zoho2025'; // Token que configuras en Meta para validar webhook
const ZOHO_FUNCTION_URL = 'https://www.zohoapis.com/crm/v7/functions/webhook_whatsapp_handler_1/actions/execute?auth_type=apikey&zapikey=1003.b577d6c8a89053d0951872bacd520289.3f8b6e86a70a939c1189fa843c2ef0e1';

// Endpoint para validación inicial del webhook (GET)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verificado');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Endpoint para recibir mensajes (POST)
app.post('/webhook', async (req, res) => {
  try {
    console.log('📥 Recibido:', JSON.stringify(req.body));

    // Enviar a Zoho con la propiedad 'payload' que espera tu función Deluge
    await axios.post(ZOHO_FUNCTION_URL, {
  numero: req.body.entry[0].changes[0].value.messages[0].from,
  mensaje: req.body.entry[0].changes[0].value.messages[0].text.body
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

// Puerto para Render.com u otro hosting
const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
