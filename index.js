const express = require('express');
const axios = require('axios');
const qs = require('qs');

const app = express();
app.use(express.json());

// ⚙️ Access Token de OAuth Zoho
const ZOHO_ACCESS_TOKEN = '000.138b739e688df47f07b8b3a096568ebb.88fe15b8a54693b314573b7951fb7fb6'; // Reemplaza por tu token válido

// ⚙️ URL de la función Deluge (sin zapikey)
const ZOHO_FUNCTION_URL = 'https://www.zohoapis.com/crm/v7/functions/whatsapp_handler_v2/actions/execute?auth_type=oauth';

app.post('/webhook', async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const value = entry?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    if (!message || !message.from) {
      console.log("⚠️ Sin mensaje válido, ignorando.");
      return res.sendStatus(200);
    }

    const numero = message.from;
    let mensaje = "";

    if (message.text?.body) {
      mensaje = message.text.body;
    } else {
      mensaje = "[Tipo de mensaje no compatible]";
    }

    console.log("🧪 Número extraído:", numero);
    console.log("🧪 Mensaje extraído:", mensaje);

    const payload = {
      numero,
      mensaje,
      json_payload: JSON.stringify(req.body)
    };

    const formData = qs.stringify(payload);

    console.log("📤 Enviando a Zoho (OAuth):", payload);

    const response = await axios.post(ZOHO_FUNCTION_URL, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Zoho-oauthtoken ${ZOHO_ACCESS_TOKEN}`
      }
    });

    console.log("✅ Respuesta Zoho:", response.data);
    res.sendStatus(200);

  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).send('Error interno del servidor');
  }
});

// ✅ Iniciar servidor
const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
