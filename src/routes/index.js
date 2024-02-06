const express = require('express');
const hotelRoute = require('./hotelRoute');

const router = express.Router({ strict: false });
router.use('/hotels', hotelRoute);

module.exports = router;
