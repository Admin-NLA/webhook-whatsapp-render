const express = require('express');
const axios = require('axios');
const qs = require('qs');

const app = express();
app.use(express.json());

// Configuración
const VERIFY_TOKEN = 'zoho2025';
const ZOHO_FUNCTION_URL = 'https://www.zohoapis.com/crm/v7/functions/whatsapp_standalone/actions/execute?auth_type=apikey&zapikey=1003.b22046226a141976ea4c8a51cf8eb73e.f16aa9a4d222d6064995247bdd2bfd7c';

// RUTA para verificar webhook de Meta (GET)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    if (!value?.messages || !value.messages[0]) {
      return res.sendStatus(200);
    }

    const message = value.messages[0];
    const numero = message.from || "";
    let mensaje = "";

    if (message?.text?.body) {
      mensaje = message.text.body;
    } else {
      mensaje = "[Tipo no soportado]";
    }

    if (!numero || !mensaje) {
      return res.sendStatus(400);
    }

    // Enviar como form-urlencoded
    const payload = qs.stringify({
      numero,
      mensaje,
      json_payload: JSON.stringify(req.body)
    });

    console.log("📤 Payload que se enviará a Zoho (form-urlencoded):", payload);

    const response = await axios.post(ZOHO_FUNCTION_URL, payload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    console.log("✅ Respuesta Zoho:", response.data);

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error procesando webhook:", error.message);
    res.status(500).send("Error interno");
  }
});

const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
