const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const VERIFY_TOKEN = 'zoho2025'; // Token que configuras en Meta para validar webhook
const ZOHO_FUNCTION_URL = 'https://www.zohoapis.com/crm/v7/functions/webhook_whatsapp_handler_1/actions/execute?auth_type=apikey&zapikey=1003.47651be1265a40e17c9ccdb21e1b52aa.4521ef9ba97222183ca492895a6b7d85';

// Validar webhook (GET)
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

// Recibir mensajes (POST)
app.post('/webhook', async (req, res) => {
  try {
    console.log('📥 Recibido:', JSON.stringify(req.body));

    // EXTRAER número y mensaje del JSON recibido
    const entry = req.body.entry && req.body.entry[0];
    const changes = entry && entry.changes && entry.changes[0];
    const value = changes && changes.value;
    const messages = value && value.messages;

    if (!messages || messages.length === 0) {
      console.warn('⚠️ No hay mensajes en el webhook');
      return res.sendStatus(200);
    }

    const messageData = messages[0];
    const numero = messageData.from || "";
    const mensaje = messageData.text && messageData.text.body || "";

    // Enviar sólo { numero, mensaje } a Zoho CRM (función Deluge espera estos parámetros simples)
    const zohoResponse = await axios.post(ZOHO_FUNCTION_URL, { numero, mensaje }, {
      headers: { 'Content-Type': 'application/json' }
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
