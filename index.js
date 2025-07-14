const express = require('express');
const axios = require('axios');
const qs = require('qs');

const app = express();
app.use(express.json());

// Reemplaza este token manualmente cada vez que caduque
const ACCESS_TOKEN = '1000.138b739e688df47f07b8b3a096568ebb.88fe15b8a54693b314573b7951fb7fb6';  // 👈 Actualiza aquí

// Endpoint del webhook de WhatsApp
app.post('/webhook', async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const value = entry?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    if (!message || !message.from) {
      console.log('⚠️ Mensaje no válido recibido.');
      return res.sendStatus(200);
    }

    const numero = message.from;
    const mensaje = message.text?.body || '[Tipo no compatible]';

    console.log('🧪 Número extraído:', numero);
    console.log('🧪 Mensaje extraído:', mensaje);

    // Preparamos el payload para Zoho
    const payload = qs.stringify({
      numero,
      mensaje,
      json_payload: JSON.stringify(req.body)
    });

    const functionUrl = 'https://www.zohoapis.com/crm/v7/functions/whatsapp_handler_v2/actions/execute?auth_type=oauth';

    const response = await axios.post(functionUrl, payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Zoho-oauthtoken ${ACCESS_TOKEN}`
      }
    });

    console.log('✅ Respuesta Zoho:', response.data);
    res.sendStatus(200);

  } catch (err) {
    console.error('❌ Error en webhook:', err.response?.data || err.message);
    res.status(500).send('Error interno');
  }
});


// ✅ Iniciar servidor
const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
