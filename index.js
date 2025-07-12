const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Token y URL de Zoho
const VERIFY_TOKEN = 'zoho2025';
const ZOHO_FUNCTION_URL = 'https://www.zohoapis.com/crm/v7/functions/whatsapp_handler_v2/actions/execute?auth_type=apikey&zapikey=1003.03b63b6e4e623744f73f7fffbddb4902.8699f916ad4a321667d278b4e23182c4';

// Validación Meta Webhook (GET)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verificado con Meta');
    res.status(200).send(challenge);
  } else {
    console.warn('❌ Verificación fallida');
    res.sendStatus(403);
  }
});

// Recepción mensajes WhatsApp (POST)
app.post('/webhook', async (req, res) => {
  try {
    console.log('📥 Payload recibido:', JSON.stringify(req.body));

    // Extraer número y mensaje del payload Meta
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const firstMessage = value?.messages?.[0];

    const numero = firstMessage?.from || "";
    const mensaje = firstMessage?.text?.body || "";

    console.log("📞 Número:", numero);
    console.log("💬 Mensaje:", mensaje);

    // Preparar payload para Zoho (JSON con input)
    const payload = {
      input: {
        numero,
        mensaje,
      },
    };

    console.log("📤 Enviando a Zoho:", JSON.stringify(payload));

    // Enviar a Zoho con JSON
    const zohoResponse = await axios.post(ZOHO_FUNCTION_URL, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    console.log("✅ Respuesta de Zoho:", zohoResponse.data);
    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error enviando a Zoho:", error.message);
    res.sendStatus(500);
  }
});

// 🚀 Iniciar servidor en Render
const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
