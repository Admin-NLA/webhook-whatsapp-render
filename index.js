const express = require('express');
const axios = require('axios');
const qs = require('qs'); // ✅ Para codificar x-www-form-urlencoded
const app = express();

app.use(express.json());

// ✅ Token y URL de función Deluge (standalone)
const VERIFY_TOKEN = 'zoho2025';
const ZOHO_FUNCTION_URL = 'https://www.zohoapis.com/crm/v7/functions/whatsapp_standalone/actions/execute?auth_type=apikey&zapikey=1003.b22046226a141976ea4c8a51cf8eb73e.f16aa9a4d222d6064995247bdd2bfd7c';

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

    const payload = qs.stringify({
      numero,
      mensaje,
      json_payload: JSON.stringify(req.body)
    });

    console.log("📤 Enviando a Zoho:", payload);

    const response = await axios.post(ZOHO_FUNCTION_URL, payload, {
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
