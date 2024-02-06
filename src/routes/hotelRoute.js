const express = require('express');
const controller = require('../controllers/hotelController');

const router = express.Router();

router.route('/')
  .get(controller.listHotels);

module.exports = router;
