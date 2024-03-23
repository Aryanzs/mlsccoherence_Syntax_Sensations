const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
require('dotenv').config();

const app = express();
const port = 3000;

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

const IG_CLIENT_ID = process.env.IG_CLIENT_ID;
const IG_CLIENT_SECRET = process.env.IG_CLIENT_SECRET;
const IG_REDIRECT_URI = process.env.IG_REDIRECT_URI;

// Route for initial authentication request
app.get('/auth/instagram', (req, res) => {
    res.redirect(`https://api.instagram.com/oauth/authorize/?client_id=${IG_CLIENT_ID}&redirect_uri=${IG_REDIRECT_URI}&response_type=code`);
});

// Route for handling the callback from Instagram after authentication
app.get('/auth/instagram/callback', (req, res) => {
    const code = req.query.code;

    // Exchange the code for an access token
    const params = {
        client_id: IG_CLIENT_ID,
        client_secret: IG_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: IG_REDIRECT_URI,
        code: code
    };

    const options = {
        url: 'https://api.instagram.com/oauth/access_token',
        method: 'POST',
        form: params,
        json: true
    };

    request(options, (error, response) => {
        if (!error && response.statusCode === 200) {
            const accessToken = response.body.access_token;

            // Use the access token to get user's information
            const userOptions = {
                url: `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`,
                method: 'GET',
                json: true
            };

            request(userOptions, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    const userData = body;
                    res.send(`
                        <img src="https://graph.instagram.com/${userData.id}/picture" />
                        <br />
                        <b>User Name: ${userData.username}</b>
                        <br />
                        <b>Account Type: ${userData.account_type}</b>
                        <br />
                        <b>Posts: ${userData.media_count}</b>
                    `);
                } else {
                    res.send('Error retrieving user data from Instagram.');
                }
            });
        } else {
            res.send('Error exchanging code for access token with Instagram.');
        }
    });
});

// Route for root URL
app.get('/', (req, res) => {
    res.send('Welcome to Instagram OAuth with Node.js and Express.js!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
