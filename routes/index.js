var router = require('express').Router();
const pgp = require('pg-promise')();

const db = pgp({connectionString: process.env.DATABASE_URL,
    ssl: {rejectUnauthorized: false}});

const users = [];

router.get('/', function (req, res, next) {
    res.render('index');
});

router.post('/register', (req, res) => {
    console.log('req.body = ' + req.body)
    const { username, password } = req.body;
    db.one('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id', [competitionName, scoringSystem[0], scoringSystem[1], scoringSystem[2], userProfile.email])
    .then(data => {
        console.log(data.id);
        user_id = data.id;
        users.push({user_id, username, password });
    })
    .catch(error => {
      console.error('Error inserting data into the users table:', error);
    });
    
    res.redirect('/SQL');
});

router.post('/login', async function (req, res, next) {
    const { username, password } = req.body;
    const users_data = await db.any('SELECT * FROM users');
    console.log(users_data);
    const user = users_data.find(u => u.username === username && u.password === password);
    if (user) {
        res.send('Login successful');
    } else {
        res.send('Invalid username or password');
    }
});

router.get('/SQL', function (req, res, next) {
    res.render('sql');
});

router.get('/CSFR', function (req, res, next) {
    res.render('csfr');
});

router.get('/noCSFR', function (req, res, next) {
    res.render('noCSFR');
});

router.get('/change-password/:username/:password', (req, res) => {
    const username = req.params.username;
    const newPassword = req.params.password;

    const user = users.find(u => u.username === username);
    const user_id = user.id;

    db.one('UPDATE users SET password = $1 WHERE id = $2', [newPassword, user_id])
    .then(data => {
        console.log(data.id);
    })
    .catch(error => {
      console.error('Error inserting data into the users table:', error);
    });

    // Logic to change the password for the given username
    // Replace this with your actual password change logic

    // Assuming you have a function to change the password in your database
    // For example:
    // changePassword(username, newPassword);

    // Send a response back
    res.send(`Password changed successfully for user: ${username}`);
});

const verifySecretToken = (req, res, next) => {
    const secretToken = req.params.secret;

    // Verify the secret token (replace 'your_secret_token' with your actual secret token)
    if (secretToken === 'your_secret_token') {
        next(); // Continue processing the request if the secret token is valid
    } else {
        res.status(401).send('Unauthorized'); // Send 401 Unauthorized if the secret token is invalid
    }
};

router.post('/change-password-secure/:username/:password/:secret', verifySecretToken, (req, res) => {
    const username = req.params.username;
    const newPassword = req.params.password;

    const user = users.find(u => u.username === username);
    const user_id = user.id;

    db.one('UPDATE users SET password = $1 WHERE id = $2', [newPassword, user_id])
    .then(data => {
        console.log(data.id);
    })
    .catch(error => {
      console.error('Error inserting data into the users table:', error);
    });

    // Logic to change the password for the given username
    // Replace this with your actual password change logic

    // Assuming you have a function to change the password in your database
    // For example:
    // changePassword(username, newPassword);

    // Send a response back
    res.send(`Password changed successfully for user: ${username}`);
});

module.exports = router;
  