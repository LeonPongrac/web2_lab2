var router = require('express').Router();

const users = [];

// Start web page
router.get('/', function (req, res, next) {
    res.render('index');
});

// Handling for logout
router.get('/logout', function (req, res, next) {
    if (req.session.user) {
        const username = req.session.user.username;
        const indexToRemove = users.findIndex(u => u.username === username);
        if (indexToRemove !== -1) {
            users.splice(indexToRemove, 1);
        }
        console.log(username);
    }
        res.redirect('/');
});

// Handling for register form post
router.post('/register', async function (req, res, next) {
    const db = res.locals.db;
    const { username, password } = req.body;
    console.log(username, password);
    await db.one('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id', [username, password])
    .then(data => {
        console.log(data.id);
        id = data.id;
        users.push({id, username, password });
        console.log(users.toString());
        req.session.user = { username };
        res.redirect('/SQL');
    })
    .catch(error => {
    console.error('Error inserting data into the users table:', error);
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: process.env.NODE_ENV !== 'production' ? err : {}
    });
    });
    
});

// Handling for login form post
router.post('/login', async function (req, res, next) {
    const db = res.locals.db;
    const { username, password } = req.body;
    const users_data = await db.any('SELECT * FROM users');
    console.log(users_data);
    const user = users_data.find(u => u.username === username && u.password === password);
    if (user) {
        console.log(user);
        const id = user.id;
        const username = user.username;
        const password = user.password;
        users.push({id , username, password });
        req.session.user = { username };
        res.redirect('/SQL');
    } else {
        res.send('Invalid username or password');
    }
});

// Home web paga and SQL Injection example
router.get('/SQL', function (req, res, next) {
    console.log('users: ' + users);
    console.log('req.session.user.username: ' + req.session.user.username);
    if (req.session.user) {
        const username = req.session.user.username;
        const result = null;
        console.log(username);
        res.render('sql', { result });
    }
    else
        res.redirect('/');
});

router.post('/sqlinput', async (req, res) => {
    const { username, password, checkbox } = req.body;
    const db = res.locals.db;

    console.log(checkbox);

    if (checkbox === 'on') {
        try {
            const result = await db.one('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
        
            res.render('sql', { result });
          } catch (error) {
            console.error('Error executing database query:', error);
        
            res.render('sql', { error: 'Error executing database query' });
          }
    }
    else{
        try {
            const queryString = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
            const result = await db.any(queryString);
            console.log(result);
        
            res.render('sql', { result });
          } catch (error) {
            console.error('Error executing database query:', error);
        
            res.render('sql', { error: 'Error executing database query' });
          }
    }
  
    
  });

// Cross Site Request Forgery example
router.get('/CSFR', function (req, res, next) {
    if (req.session.user) {
        const username = req.session.user.username;
        console.log(username);
        res.render('csfr', {username});
    }
    else
        res.redirect('/');
});

// Cross Site Request Forgery prevention example
router.get('/noCSFR', function (req, res, next) {
    if (req.session.user) {
        const username = req.session.user.username;
        console.log(username);
        res.render('noCSFR', {username});
    }
    else
        res.redirect('/');
});

// Get metod for Cross Site Request Forgery example
router.get('/change-password/:username/:password', async (req, res) => {
    const db = res.locals.db;
    const username = req.params.username;
    const newPassword = req.params.password;
    try {
        const user = users.find(u => u.username === username);
        const user_id = user.id;

        const data = await db.one('UPDATE users SET password = $1 WHERE id = $2 RETURNING id', [newPassword, user_id]);
        console.log(data.id);

        /*const indexToRemove = users.findIndex(u => u.username === username);
        if (indexToRemove !== -1) {
            users.splice(indexToRemove, 1);
        }*/

        console.log('Redirecting to /');
        res.redirect('/');
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Metod to verify the secret token
const verifySecretToken = (req, res, next) => {
    const secretToken = req.params.secret;

    if (secretToken === '72c8ef6a1b80c57946b6f03b4967e01a') {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
};

// Post metod for Cross Site Request Forgery prevention example
router.post('/change-password-secure/:username/:password/:secret', verifySecretToken, (req, res) => {
    const db = res.locals.db;
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

    res.redirect('/');
});

module.exports = router;
  