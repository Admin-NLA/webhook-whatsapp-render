const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// Variables
const VERIFY_TOKEN = 'zapoho123'; // <-- usa este mismo en Meta
const ZOHO_WEBHOOK_URL = 'https://www.zohoapis.com/crm/v7/functions/webhook_whatsapp_handler_1/actions/execute?auth_type=apikey&zapikey=1003.b9d8da043cab069340e69e55cdad863c.a27a1bd7123800657c230e361e9b5ed7';

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verificado');
    res.status(200).send(challenge); // ← esto debe devolver el challenge puro
  } else {
    res.sendStatus(403);
  }
});

// ✅ Endpoint para recibir mensajes
app.post('/webhook', async (req, res) => {
  try {
    console.log("📥 Recibido:", JSON.stringify(req.body));
    
    // Enviar a función webhook_whatsapp_handler_1
    await axios.post(ZOHO_WEBHOOK_URL, req.body, {
      headers: { 'Content-Type': 'application/json' }
    });

    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Error al enviar a Zoho:', err.message);
    res.sendStatus(500);
  }
});

// ✅ Endpoint básico de prueba
app.get('/', (req, res) => {
  res.send('✅ Webhook activo');
});

// ✅ Escuchar puerto correcto (para Render)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
