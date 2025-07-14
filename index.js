const express = require('express');
const axios = require('axios');
const qs = require('qs');
const app = express();

app.use(express.json());

// Token y URL de Zoho
const VERIFY_TOKEN = 'zoho2025';
const ZOHO_FUNCTION_URL = 'https://www.zohoapis.com/crm/v7/functions/whatsapp_handler_v2/actions/execute?auth_type=apikey&zapikey=1003.03b63b6e4e623744f73f7fffbddb4902.8699f916ad4a321667d278b4e23182c4';

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

// ✅ Recepción de mensajes entrantes desde WhatsApp (POST)
app.post('/webhook', async (req, res) => {
  try {
    console.log('📥 Payload recibido:', JSON.stringify(req.body));

    // 📤 Extraer los datos relevantes del mensaje de WhatsApp
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const firstMessage = value?.messages?.[0];

    const numero = firstMessage?.from || "";
    const mensaje = firstMessage?.text?.body || "";

    console.log("🧪 Número original extraído:", numero);
    console.log("🧪 Mensaje extraído:", mensaje);

    // ✅ Validación adicional de longitud y limpieza del número
    const numeroLimpio = numero.replace(/[^\d]/g, '').slice(0, 13);  // Elimina caracteres no numéricos y corta a 13 dígitos
    console.log("🔎 Número limpio:", numeroLimpio, "| longitud:", numeroLimpio.length);

    // ⚠️ Validar que el número y mensaje no estén vacíos
    if (!numeroLimpio || !mensaje) {
      console.warn("⚠️ Número o mensaje vacíos, no se enviará a Zoho.");
      return res.sendStatus(400);
    }

    // 📦 Convertir los datos a formato x-www-form-urlencoded
    const params = qs.stringify({ numero: numeroLimpio, mensaje });
    console.log("📤 Payload a Zoho:", params);

    // 🚀 Enviar los datos a Zoho CRM vía Deluge Function
    const zohoResponse = await axios.post(ZOHO_FUNCTION_URL, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
