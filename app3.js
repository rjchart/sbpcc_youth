var express = require('express');

var admin = express(); // the sub app

admin.get('/', function (req, res) {
  res.send('Admin Homepage');
});
