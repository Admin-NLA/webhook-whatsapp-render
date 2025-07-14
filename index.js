const express = require('express');
const axios = require('axios');
const qs = require('qs'); //✅ Para codificar como x-www-form-urlencoded
const app = express();

app.use(express.json());

// Token y URL de Zoho
const VERIFY_TOKEN = 'zoho2025';
const ZOHO_FUNCTION_URL = 'https://www.zohoapis.com/crm/v7/functions/whatsapp_handler_v2/actions/execute?auth_type=apikey&zapikey=1003.7ac01f6d1f55de25633046b3881a02ed.3936bae7c6809a39aded361220909e9b';

/* -------------------------------------------
   ✅ 1. VERIFICACIÓN WEBHOOK DE META
-------------------------------------------- */
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

/* -------------------------------------------
   ✅ 2. PROCESAR MENSAJES ENTRANTES
-------------------------------------------- */
app.post('/webhook', async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

     if (!value?.messages || !value.messages[0]) {
      console.warn("⚠️ No se encontró value.messages[0], ignorando evento.");
      return res.sendStatus(200); // OK, ignorar este evento
    }
     const message = value.messages[0];
    const numero = message.from || "";
    let mensaje = "";

      // Extraer contenido según tipo de mensaje
      if (message?.text?.body) {
        mensaje = message.text.body;
      } else if (message?.type === "image" && message?.image?.caption) {
        mensaje = message.image.caption;
      } else if (message?.type === "image") {
        mensaje = "[Imagen recibida]";
      } else if (message?.type === "audio") {
        mensaje = "[Audio recibido]";
      } else if (message?.type === "video") {
        mensaje = "[Video recibido]";
      } else if (message?.type === "sticker") {
        mensaje = "[Sticker recibido]";
      } else if (message?.type === "button") {
        mensaje = `[Botón presionado: ${message.button.text}]`;
      } else if (message?.type === "interactive") {
        mensaje = `[Interacción: ${JSON.stringify(message.interactive)}]`;
      } else {
        mensaje = `[Tipo desconocido: ${message?.type || "sin tipo"}]`;
      }
    } 
     
    // Log intermedio
    console.log("🧪 Número extraído:", numero);
    console.log("🧪 Mensaje extraído:", mensaje);

    // Validar antes de enviar
    if (!numero || !mensaje) {
      console.warn("⚠️ Número o mensaje vacíos. No se enviará a Zoho.");
      return res.sendStatus(400);
    }

    // Codificar como x-www-form-urlencoded
    const payload = qs.stringify({
      numero,
      mensaje,
      json_payload: JSON.stringify(req.body) // opcional: enviar todo el JSON
    });

     console.log("📤 Payload que se enviará a Zoho (form-urlencoded):", payload);

    // Enviar a Zoho
    const response = await axios.post(ZOHO_FUNCTION_URL, payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log("✅ Enviado a Zoho:", response.data);
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Error procesando webhook:", err.message);
    res.status(500).send(`Error interno: ${err.message}`);
  }
});

/* -------------------------------------------
   🚀 INICIAR SERVIDOR
-------------------------------------------- */
const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
