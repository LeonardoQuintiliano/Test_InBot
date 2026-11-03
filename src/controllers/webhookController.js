const webhookService = require('../services/webhookService');

module.exports = {
    async handleWebhook(req, res) {
        try {
            const result = await webhookService.processWebhook(req.body);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
};