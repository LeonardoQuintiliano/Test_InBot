const { Router } = require('express');
const campaignController = require('../controllers/campaignController');

const router = Router();

router.post('/campaign', campaignController.createCampaign);
router.post('/campaigns/:id/start', campaignController.startCampaign);

module.exports = router;