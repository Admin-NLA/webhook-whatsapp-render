const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = 'zapoho123';
const ZOHO_WEBHOOK_URL = 'https://www.zohoapis.com/crm/v7/functions/webhook_whatsapp_handler_1/actions/execute?auth_type=apikey&zapikey=1003.2daf0e4222f2bc126857f330ae51451b.22f27796ab56cfc36a65d1de46c157f8';

app.get('/', (req, res) => {
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

app.post('/', async (req, res) => {
  try {
    console.log("📥 Recibido:", JSON.stringify(req.body));
    await axios.post(ZOHO_WEBHOOK_URL, req.body, {
      headers: { 'Content-Type': 'application/json' }
    });
    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Error al enviar a Zoho:', err.message);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor escuchando en puerto ${PORT}`));
