const express = require('express');
const axios = require('axios');
const qs = require('qs');

const app = express();
app.use(express.json());

// ✅ URL de tu función Deluge
const ZOHO_FUNCTION_URL = 'https://www.zohoapis.com/crm/v7/functions/whatsapp_handler_v2/actions/execute?auth_type=apikey&zapikey=1003.dc57ed21c847a6381321b9721e9dc383.628eca773dc3d1a65f03a293653c670d';

/* -------------------------------------------
   ✅ PROCESAR MENSAJES ENTRANTES
-------------------------------------------- */
app.post('/webhook', async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const value = entry?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    if (!message || !message.from) return res.sendStatus(200);
     
    const payload = {
      numero: message.from,
      mensaje: message.text?.body || '[tipo no soportado]',
      json_payload: req.body
    };

    console.log('🧪 Enviando payload completo a Zoho:', payload);

    // Envía el objeto payload COMO JSON directamente
    const response = await axios.post(ZOHO_FUNCTION_URL, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('✅ Respuesta Zoho:', response.data);
    res.sendStatus(200);

  } catch (error) {
    console.error('❌ Error en webhook:', error.response?.data || error.message);
    res.status(500).send('Error interno');
  }
});

/* -------------------------------------------
   🚀 INICIAR SERVIDOR
-------------------------------------------- */
const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
