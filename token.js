require('dotenv').config();
const axios = require('axios');
const qs = require('querystring');

/**
 * Exchange Instagram auth code for long-lived access token
 */
 async function getInstagramLongLivedToken(authCode) {
  try {
    // ----------------------------------
    // STEP 1: auth code -> short-lived token
    // ----------------------------------
    console.log({
        client_id: process.env.INSTAGRAM_APP_ID,
        client_secret: process.env.INSTAGRAM_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
        code: authCode
      })
    const shortTokenResponse = await axios.post(
      'https://api.instagram.com/oauth/access_token',
      qs.stringify({
        client_id: process.env.INSTAGRAM_APP_ID,
        client_secret: process.env.INSTAGRAM_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: "https://insta-project-ten.vercel.app/auth/callback",
        code: authCode
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const shortTokenData = shortTokenResponse.data.data[0];

    const shortLivedToken = shortTokenData.access_token;
    const instagramUserId = shortTokenData.user_id;
    console.log('Short Lived Token: ', shortLivedToken);
    // ----------------------------------
    // STEP 2: short-lived -> long-lived token
    // ----------------------------------
    const longTokenResponse = await axios.get(
      'https://graph.instagram.com/access_token',
      {
        params: {
          grant_type: 'ig_exchange_token',
          client_secret: process.env.INSTAGRAM_APP_SECRET,
          access_token: shortLivedToken
        }
      }
    );

    return {
      instagramUserId: instagramUserId,
      accessToken: longTokenResponse.data.access_token,
      expiresIn: longTokenResponse.data.expires_in
    };

  } catch (error) {
    if (error.response) {
      throw new Error(
        `Instagram OAuth error: ${JSON.stringify(error.response.data)}`
      );
    }
    throw error;
  }
}

module.exports = { getInstagramLongLivedToken };