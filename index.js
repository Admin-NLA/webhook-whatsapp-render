const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// Token y URL de Zoho
const VERIFY_TOKEN = 'zoho2025';
const ZOHO_FUNCTION_URL = 'https://www.zohoapis.com/crm/v7/functions/webhook_whatsapp_handler_1/actions/execute?auth_type=apikey&zapikey=1003.cdcbaadc01252ad59c6ca63009648323.c968f933ab267d4c01bda867eedd8426';

// Verificación del Webhook con Meta
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

// Recibir mensajes
app.post('/webhook', async (req, res) => {
  try {
    console.log('📥 Recibido:', JSON.stringify(req.body));

    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const messageData = change?.value?.messages?.[0];

    const numero = messageData?.from || '';
    const mensaje = messageData?.text?.body || '';

    console.log('📞 Número:', numero);
    console.log('💬 Mensaje:', mensaje);

    // Preparar parámetros
    const params = new URLSearchParams();
    params.append('numero', numero);
    params.append('mensaje', mensaje);

    console.log('📤 Enviando a Zoho...');

    const zohoResponse = await axios.post(ZOHO_FUNCTION_URL, params.toString(), {
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
