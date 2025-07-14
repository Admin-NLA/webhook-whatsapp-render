const express = require('express');
const axios = require('axios');
const qs = require('qs'); // ✅ Para codificar x-www-form-urlencoded

const app = express();
app.use(express.json());

// ✅ Token y URL de función Deluge (standalone)
const VERIFY_TOKEN = 'zoho2025';
const ZOHO_FUNCTION_URL = 'https://www.zohoapis.com/crm/v7/functions/whatsapp_handler_v2/actions/execute?auth_type=apikey&zapikey=1003.aafb07e6eca6742524076dc726f9d612.4b1b6813f57700e02e084366be7dbd77';

app.post('/webhook', async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const value = entry?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    if (!message?.from || !message.text?.body) {
      console.log("⚠️ Mensaje vacío o tipo no compatible.");
      return res.sendStatus(200);
    }

    const numero = message.from;
    const mensaje = message.text.body;
    const payload = {
      numero,
      mensaje,
      json_payload: JSON.stringify(req.body)
    };

    const formData = qs.stringify(payload);
    console.log("📤 Enviando a Zoho:", formData);

    const response = await axios.post(ZOHO_FUNCTION_URL, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    console.log("✅ Respuesta Zoho:", response.data);
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.sendStatus(500);
  }
});

const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
