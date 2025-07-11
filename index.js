const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// Tu token de verificación de Meta (WhatsApp)
const VERIFY_TOKEN = 'zoho2025';
// URL de tu función publicada en Zoho CRM
const ZOHO_FUNCTION_URL = 'https://www.zohoapis.com/crm/v7/functions/webhook_whatsapp_handler_1/actions/execute?auth_type=apikey&zapikey=1003.cdcbaadc01252ad59c6ca63009648323.c968f933ab267d4c01bda867eedd8426';

// 🔐 Verificación del Webhook (GET) para Meta
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verificado por Meta');
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

app.post('/webhook', async (req, res) => {
  try {
    console.log('📥 Recibido:', JSON.stringify(req.body));

    // Extraer datos del body con seguridad
    const entry = req.body.entry && req.body.entry[0];
    const changes = entry && entry.changes && entry.changes[0];
    const value = changes && changes.value;
    const message = value && value.messages && value.messages[0];

    if (!message) {
      console.log('⚠️ No hay mensaje en el webhook');
      return res.sendStatus(200);
    }

    const numero = message.from || '';
    const texto = message.text && message.text.body ? message.text.body : '';

    console.log('📞 Número:', numero);
    console.log('💬 Mensaje:', texto);

    // Construir params para enviar a Zoho
    const params = new URLSearchParams();
    params.append('numero', numero);
    params.append('mensaje', texto);

    // POST a Zoho usando string URL encoded
    const zohoResponse = await axios.post(ZOHO_FUNCTION_URL, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
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
