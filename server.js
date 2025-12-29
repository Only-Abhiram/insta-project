require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const  {getInstagramLongLivedToken}  = require('./token.js');


const app = express();

// IMPORTANT: raw body needed for signature verification
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

const PORT = process.env.PORT || 5000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const APP_SECRET = process.env.APP_SECRET;


/**
 * Utility: Verify Meta X-Hub-Signature
 */
function isValidSignature(req) {
  const signature = req.headers['x-hub-signature'];
  if (!signature || !APP_SECRET) return false;

  const [algo, hash] = signature.split('=');

  const expectedHash = crypto
    .createHmac(algo, APP_SECRET)
    .update(req.rawBody)
    .digest('hex');

  return hash === expectedHash;
}

/**
 * Phase A: Webhook Verification (GET)
 */
app.get('/instagram', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if ( token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully');
    return res.status(200).send(challenge);
  }

  console.log('Webhook verification failed');
  return res.sendStatus(403);
});

/**
 * Phase B: Event Delivery (POST)
 */
app.post('/instagram', (req, res) => {
  // Optional but recommended
//   if (!isValidSignature(req)) {
//     console.warn('Invalid X-Hub-Signature');
//     return res.sendStatus(401);
//   }

  console.log('Webhook event received');
  console.dir(req.body, { depth: null });

  /**
   * Typical structure:
   * req.body.entry[].changes[].value
   */

  // Always respond fast
  res.sendStatus(200);

  // Process asynchronously later if needed
});

// Redirect Auth

app.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).send('Missing auth code');
  }

  try {
  
    console.log(code);
    // const { instagramUserId, accessToken , expiresIn } = await getInstagramLongLivedToken(code);
    // console.log('Instagram User ID: ', instagramUserId);
    // console.log('Access Token(Long Lived): ', accessToken);
    // console.log('Expires In: ', expiresIn);

    // console.log('Instagram connected successfully ✅');
    // // put them in the database
    // // TODO: Redirect to dashboard
    // res.redirect('https://www.google.com')
    // // res.redirect('/success.html');
    res.status(200).send('Code received');

  } catch (err) {
    console.error(err);
    res.status(500).send('OAuth failed');
  }
});

/**
 * Health check
 */
app.get('/', (req, res) => {
  res.send('Instagram webhook is running');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
