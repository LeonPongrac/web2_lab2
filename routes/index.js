var router = require('express').Router();

const users = [];

router.get('/', function (req, res, next) {
    res.render('index');
});

router.post('/register', (req, res) => {
    const { username, password } = req.body;
    // Validate and handle registration logic (e.g., add user to the database)
    users.push({ username, password });
    res.redirect('/SQL');
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Validate and handle login logic (check if the user exists in the database)
    const user = users.find(u => u.username === username && u.password === password);
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

module.exports = router;
  