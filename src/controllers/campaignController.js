const campaignService = require('../services/campaignService');

module.exports = {
    async createCampaign(req, res) {
        try {
            const result = await campaignService.createCampaign(req.body);
            return res.status(201).json({
              message: 'Campanha criada com sucesso!',
              data: result
            });
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    },

    async startCampaign(req, res) {
        try {
            const { id } = req.params;
            const result = await campaignService.startCampaign(id);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
};