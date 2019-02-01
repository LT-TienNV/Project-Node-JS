var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('pages/dashboard/index', {pageTitle: 'Dashboard', 'coursename': '<p>NodeJS</p>'});
});

module.exports = router;