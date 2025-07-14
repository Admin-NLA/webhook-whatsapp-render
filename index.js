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

    // Crear el payload como objeto plano
const payload = {
  numero: numero,
  mensaje: mensaje,
  json_payload: JSON.stringify(req.body),
};
    
// Serializar correctamente el payload
const formData = qs.stringify(payload);
    
    console.log("📤 Enviando a Zoho:", payload);

 // Enviar con headers correctos
await axios.post(ZOHO_FUNCTION_URL, formData, {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
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
