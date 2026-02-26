const express = require('express');
const identityController = require('../controllers/identityController');

const router = express.Router();

router.post('/identify', identityController.identify);
router.get('/health', identityController.healthCheck);

module.exports = router;
