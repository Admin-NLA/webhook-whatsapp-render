const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = 'zoho2025'; // El token que configuras en Meta para validar
const ZOHO_FUNCTION_URL = 'https://www.zohoapis.com/crm/v7/functions/webhook_whatsapp_handler_1/actions/execute?auth_type=apikey&zapikey=1003.fc864949ec8b86d4d7f29d06b59645ca.56181fa66c0726afcc57ccfaecf6c592';

// Validar webhook con Meta (GET)
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

    // ✅ Enviar payload completo como JSON
    const zohoResponse = await axios.post(ZOHO_WEBHOOK_URL, req.body, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('✅ Enviado a Zoho:', zohoResponse.data);
    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error enviando a Zoho:', error.message);
    res.sendStatus(500);
  }
});

const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
