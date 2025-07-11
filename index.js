const express = require('express');
const axios = require('axios');
const qs = require('qs'); // 👈 Librería para formatear correctamente el body
const app = express();

app.use(express.json());

// Token de verificación con Meta
const VERIFY_TOKEN = 'zoho2025';

// URL de tu función publicada en Zoho CRM con API Key
const ZOHO_FUNCTION_URL = 'https://www.zohoapis.com/crm/v7/functions/webhook_whatsapp_handler_1/actions/execute?auth_type=apikey&zapikey=1003.cdcbaadc01252ad59c6ca63009648323.c968f933ab267d4c01bda867eedd8426';

// ✅ Validación del webhook de Meta
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

// ✅ Recepción de mensajes de WhatsApp
app.post('/webhook', async (req, res) => {
  try {
    console.log('📥 Payload recibido:', JSON.stringify(req.body));

    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const firstMessage = value?.messages?.[0];

    const numero = firstMessage?.from;
    const mensaje = firstMessage?.text?.body;

    console.log("📞 Número:", numero);
    console.log("💬 Mensaje:", mensaje);

    // Validar que haya datos antes de enviar
    if (!numero || !mensaje) {
      console.warn("⚠️ Número o mensaje vacío, no se enviará a Zoho");
      return res.sendStatus(200);
    }

    // ✅ Formatear datos correctamente como x-www-form-urlencoded
  const params = new URLSearchParams();
params.append("numero", numero);
params.append("mensaje", mensaje);

const zohoResponse = await axios({
  method: 'post',
  url: ZOHO_FUNCTION_URL,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  data: params.toString() // 👈 ESTE DETALLE IMPORTANTE
});

    console.log("✅ Respuesta de Zoho:", zohoResponse.data);
    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error al enviar a Zoho:", error.message);
    res.sendStatus(500);
  }
});

// 🚀 Iniciar servidor en Render
const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
