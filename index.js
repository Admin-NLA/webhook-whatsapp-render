const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = 'zoho2025'; // El token que configuras en Meta para validar
const ZOHO_WEBHOOK_URL = 'https://www.zohoapis.com/crm/v7/functions/webhook_whatsapp_handler_1/actions/execute?auth_type=apikey&zapikey=1003.e1fbde5755e3c14e1bf9a4ad12f9c106.66dd3fd5a712641bc767f5089e36d65f';

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verificado por Meta');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  try {
    console.log('📥 Mensaje recibido de Meta:', JSON.stringify(req.body));

    // Reenviar el payload a Zoho
    await axios.post(ZOHO_WEBHOOK_URL, req.body, {
      headers: { 'Content-Type': 'application/json' }
    });

    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error reenviando a Zoho:', error.message);
    res.sendStatus(500);
  }
});

// Endpoint básico para comprobar que el servidor está activo
app.get('/', (req, res) => {
  res.send('✅ Servidor webhook activo');
});

// Usar puerto que da Render o 3000 localmente
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
