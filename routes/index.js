var router = require('express').Router();

router.get('/', function (req, res, next) {
    res.render('index');
});

router.get('/CSFR', function (req, res, next) {
    res.render('csfr');
});

router.get('/noCSFR', function (req, res, next) {
    res.render('noCSFR');
});

module.exports = router;
  