const express = require('express');
const axios = require('axios');
const qs = require('qs');

const app = express();
app.use(express.json());

// ✅ Access Token OAuth2 válido (dura 1 hora)
const ACCESS_TOKEN = '1000.d925407acfdc53f5efdb258c75ab9a6c.de8bf253762992c41067642a635f80e6';

// ✅ URL de tu función Deluge con OAuth2
const ZOHO_FUNCTION_URL = 'https://www.zohoapis.com/crm/v7/functions/whatsapp_handler_v2/actions/execute?auth_type=oauth';

/* -------------------------------------------
   ✅ PROCESAR MENSAJES ENTRANTES
-------------------------------------------- */
app.post('/webhook', async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const value = entry?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    if (!message || !message.from) {
      console.log("⚠️ Mensaje no válido, se ignora.");
      return res.sendStatus(200);
    }

    const numero = message.from;
    const mensaje = message.text?.body || '[Tipo no soportado]';

    console.log("🧪 Número extraído:", numero);
    console.log("🧪 Mensaje extraído:", mensaje);

    // Payload para enviar a Zoho
    const payload = qs.stringify({
      numero,
      mensaje,
      json_payload: JSON.stringify(req.body)
    });

    console.log("📤 Enviando a Zoho (OAuth):", payload);

    // Enviar a función Deluge usando OAuth2
    const response = await axios.post(ZOHO_FUNCTION_URL, payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Zoho-oauthtoken ${ACCESS_TOKEN}`
      }
    });

    console.log("✅ Respuesta Zoho:", response.data);
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Error en webhook:", err.response?.data || err.message);
    res.status(500).send('Error en servidor');
  }
});

/* -------------------------------------------
   🚀 INICIAR SERVIDOR
-------------------------------------------- */
const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
