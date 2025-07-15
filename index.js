const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json()); // Asegura que el cuerpo JSON sea leído correctamente

const ZOHO_FLOW_WEBHOOK = 'https://flow.zoho.com/716055707/flow/webhook/incoming?zapikey=1001.2dc963ebd52a5e0694b57ff0f07a3d50.df5a07214529691b4331959238949800&isdebug=true'; // 🟢 Usa tu URL real

app.post('/webhook-whatsapp', async (req, res) => {
  try {
    const body = req.body;

    // ✅ Extraer datos desde el payload de WhatsApp (Meta)
    const numero = body.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.wa_id;
    const mensaje = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body;

    if (!numero || !mensaje) {
      console.log('⚠️ Datos incompletos recibidos');
      return res.sendStatus(400);
    }

    // 🔁 Enviar a Zoho Flow
    const response = await axios.post(ZOHO_FLOW_WEBHOOK, {
      numero,
      mensaje
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('📤 Enviado a Zoho Flow:', response.status);
    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error enviando a Zoho Flow:', error.message);
    res.sendStatus(500);
  }
});


// 🚀 Iniciar servidor en Render
const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(✅ Servidor escuchando en puerto ${PORT});
});
