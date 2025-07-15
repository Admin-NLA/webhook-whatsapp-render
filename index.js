const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json()); // Asegura que el cuerpo JSON sea leído correctamente

const ZOHO_FLOW_WEBHOOK = 'https://flow.zoho.com/716055707/flow/webhook/incoming?zapikey=1001.a37ca2318e4104a7310c8f4c0aa00e51.d717b769e22c644242ac741a8f112872&isdebug=false'; // 🟢 Usa tu URL real

// Ruta principal de Meta Webhook
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    // ✅ Extraer número y mensaje del webhook de WhatsApp (Meta)
    const numero = body?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.wa_id;
    const mensaje = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body;

    console.log('📥 Mensaje entrante:', { numero, mensaje });

    if (!numero || !mensaje) {
      console.warn('⚠️ No se pudo extraer número o mensaje.');
      return res.sendStatus(400);
    }

    // 🔁 Reenviar a Zoho Flow
    await axios.post(ZOHO_FLOW_WEBHOOK, {
      numero,
      mensaje
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Mensaje enviado a Zoho Flow');
    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error reenviando a Zoho Flow:', error.message);
    res.sendStatus(500);
  }
});

// Ruta de verificación para Meta (opcional si ya está configurado)
app.get('/webhook', (req, res) => {
  const verify_token = 'tu_token_de_verificacion';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token === verify_token) {
    console.log('🔐 Webhook verificado');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

/* -------------------------------------------
   🚀 INICIAR SERVIDOR
-------------------------------------------- */
const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
