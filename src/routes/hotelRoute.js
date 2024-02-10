const express = require("express");
const controller = require("../controllers/hotelController");
const validateParams = require("../middlewares/validationMiddleware");

const router = express.Router();

router.route("/")
  .get(validateParams, controller.listHotels);

module.exports = router;
