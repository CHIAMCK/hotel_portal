const { query, validationResult } = require('express-validator');

const validateParams = [
  query('destinationId').optional().isInt().withMessage('Destination ID must be an integer'),
  query('hotelIds').optional().custom(value => {
    if (typeof value !== 'string') {
      throw new Error('Hotel IDs must be a string');
    }
    return true;
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = validateParams;
