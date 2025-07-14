const express = require('express');
const axios = require('axios');
const qs = require('qs');

const app = express();
app.use(express.json());

// Tus credenciales OAuth2 (reemplaza con las reales)
const CLIENT_ID = '000.KU5DM59YJO9HM8M9A26SPCMXGJ5BRF';
const CLIENT_SECRET = '5fb349dba4dc5bdcd24b80f65d8e3706c54b2516e5';
const REFRESH_TOKEN = '1000.4274e1a0f127c547054548241e196d7d.f2b67671d6d4c2451375b7265596bd69';

// Estado para guardar el access_token y su expiración
let accessToken = null;
let tokenExpiresAt = 0;

// Función para renovar access_token si está expirado o no existe
async function ensureAccessToken() {
  const now = Date.now();

  if (!accessToken || now >= tokenExpiresAt) {
    console.log('⏳ Renovando access_token...');
    const params = new URLSearchParams();
    params.append('refresh_token', REFRESH_TOKEN);
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('grant_type', 'refresh_token');

    try {
      const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', params);
      accessToken = response.data.access_token;
      const expiresIn = response.data.expires_in; // en segundos
      tokenExpiresAt = now + (expiresIn - 60) * 1000; // renovar 1 min antes de expirar
      console.log('✅ Nuevo access_token obtenido:', accessToken.slice(0, 10) + '...');
    } catch (error) {
      console.error('❌ Error al renovar token:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Endpoint para webhook WhatsApp
app.post('/webhook', async (req, res) => {
  try {
    // Extraer datos WhatsApp
    const entry = req.body.entry?.[0];
    const value = entry?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    if (!message || !message.from) {
      console.log("⚠️ Sin mensaje válido, ignorando.");
      return res.sendStatus(200);
    }

    const numero = message.from;
    const mensaje = message.text?.body || '[Tipo no soportado]';

    console.log('🧪 Número extraído:', numero);
    console.log('🧪 Mensaje extraído:', mensaje);

    await ensureAccessToken();

    // Payload x-www-form-urlencoded para Zoho
    const payload = qs.stringify({
      numero,
      mensaje,
      json_payload: JSON.stringify(req.body),
    });

    const functionUrl = 'https://www.zohoapis.com/crm/v7/functions/whatsapp_handler_v2/actions/execute?auth_type=oauth';

    // Llamar función Deluge con OAuth2
    const response = await axios.post(functionUrl, payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    });

    console.log('✅ Respuesta Zoho:', response.data);
    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Error en webhook:', err.response?.data || err.message);
    res.status(500).send('Error interno');
  }
});

// ✅ Iniciar servidor
const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
