import express from 'express';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Expect FCM_SERVER_KEY in .env (legacy server key)
const { FCM_SERVER_KEY, PORT = 4000 } = process.env;
if (!FCM_SERVER_KEY) {
  console.error('⚠️  FCM_SERVER_KEY manquant dans le fichier .env');
  process.exit(1);
}

// Initialise Firebase Admin SDK : nécessite un compte de service
// Place le chemin du JSON dans GOOGLE_APPLICATION_CREDENTIALS ou SERVICE_ACCOUNT_PATH.
const serviceAccountPath = process.env.SERVICE_ACCOUNT_PATH;
admin.initializeApp({
  credential: serviceAccountPath ? admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))) : admin.credential.applicationDefault(),
});

const app = express();
app.use(express.json());

// Sert les fichiers statiques (sender.html)
app.use(express.static(path.join(__dirname, 'public')));

function basicAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [, b64] = header.split(' ');
  if (!b64) {
    res.set('WWW-Authenticate', 'Basic realm="notif"');
    return res.status(401).end();
  }
  const [user, pass] = Buffer.from(b64, 'base64').toString().split(':');
  if (user === 'admin' && pass === FCM_SERVER_KEY) return next();
  res.set('WWW-Authenticate', 'Basic realm="notif"');
  return res.status(401).end('Unauthorized');
}

app.post('/send', basicAuth, async (req, res) => {
  const { token, title = 'Finéa', body = '' } = req.body || {};
  if (!token) return res.status(400).send('token requis');
  try {
    const message = {
      notification: { title, body },
      token,
    };
    const response = await admin.messaging().send(message);
    res.send(response);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.listen(PORT, () => console.log(`🚀 Notification sender API sur http://localhost:${PORT}`));
