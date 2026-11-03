const { Router } = require('express');
const webhookController = require('../controllers/webhookController');

const router = Router();

router.post('/webhook/provider', webhookController.handleWebhook);

module.exports = router;