const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const VERIFY_TOKEN = 'zoho2025'; // Token que configuras en Meta para validar webhook
const ZOHO_FUNCTION_URL = 'https://www.zohoapis.com/crm/v7/functions/webhook_whatsapp_handler_1/actions/execute?auth_type=apikey&zapikey=1003.47651be1265a40e17c9ccdb21e1b52aa.4521ef9ba97222183ca492895a6b7d85';

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

app.post('/webhook', async (req, res) => {
  try {
    console.log('📥 Recibido:', JSON.stringify(req.body));

    // Extraer número y mensaje desde el payload recibido
    let numero = null;
    let mensaje = null;

    if (
      req.body.entry &&
      req.body.entry[0] &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
    ) {
      const messageData = req.body.entry[0].changes[0].value.messages[0];
      numero = messageData.from || null;
      mensaje = (messageData.text && messageData.text.body) || null;
    }

    if (!numero || !mensaje) {
      console.log('⚠️ No se pudo extraer número o mensaje del payload');
      return res.sendStatus(400);
    }

    // Enviar solo los parámetros planos que espera Zoho
    const zohoPayload = {
      numero: numero,
      mensaje: mensaje,
    };

    const zohoResponse = await axios.post(ZOHO_FUNCTION_URL, zohoPayload, {
      headers: { 'Content-Type': 'application/json' },
    });

// Puerto para Render.com u otro hosting
const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
