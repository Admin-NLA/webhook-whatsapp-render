const express = require('express');
const axios = require('axios');
const qs = require('qs'); // ✅ Para codificar x-www-form-urlencoded
const app = express();

app.use(express.json());

// ✅ Token y URL de función Deluge (standalone)
const VERIFY_TOKEN = 'zoho2025';
const ZOHO_FUNCTION_URL = 'https://www.zohoapis.com/crm/v7/functions/whatsapp_standalone/actions/execute?auth_type=apikey&zapikey=1003.b22046226a141976ea4c8a51cf8eb73e.f16aa9a4d222d6064995247bdd2bfd7c';

// ✅ Verificación del Webhook de Meta
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === 'zoho2025') {
    console.log('✅ Webhook verificado');
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// ✅ Procesamiento de mensajes entrantes
app.post('/webhook', async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    if (!value?.messages || !value.messages[0]) {
      console.warn('⚠️ No es un mensaje entrante. Ignorado.');
      return res.sendStatus(200);
    }

    const message = value.messages[0];
    const numero = message.from || '';
    let mensaje = '';

    if (message.text?.body) mensaje = message.text.body;
    else if (message.type === 'image' && message.image?.caption) mensaje = message.image.caption;
    else if (message.type === 'image') mensaje = '[Imagen recibida]';
    else if (message.type === 'audio') mensaje = '[Audio recibido]';
    else if (message.type === 'video') mensaje = '[Video recibido]';
    else if (message.type === 'sticker') mensaje = '[Sticker recibido]';
    else if (message.type === 'button') mensaje = `[Botón: ${message.button?.text}]`;
    else mensaje = `[Tipo desconocido: ${message.type || 'N/A'}]`;

    console.log('🧪 Número extraído:', numero);
    console.log('🧪 Mensaje extraído:', mensaje);

    if (!numero || !mensaje) {
      console.warn('⚠️ Número o mensaje vacíos. No se enviará a Zoho.');
      return res.sendStatus(400);
    }

    // ✅ Enviar a Zoho como x-www-form-urlencoded
    const payload = qs.stringify({
      numero,
      mensaje,
      json_payload: JSON.stringify(req.body)
    });

    console.log('📤 Enviando a Zoho:', payload);

    const response = await axios.post(ZOHO_FUNCTION_URL, payload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    console.log('✅ Respuesta Zoho:', response.data);
    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.sendStatus(500);
  }
});

const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
