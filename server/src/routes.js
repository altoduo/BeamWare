var express = require('express');
var router = express.Router();

router.post('/rpc/registration', function(req, res) {
    res.send(200).end();
});

module.exports = router;
