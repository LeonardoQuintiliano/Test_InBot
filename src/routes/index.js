const { Router } = require('express');
const campaignRoutes = require('./campaignRoutes');
const webhookRoutes = require('./webhookRoutes');

const router = Router();

router.use(campaignRoutes);
router.use(webhookRoutes);

module.exports = router;