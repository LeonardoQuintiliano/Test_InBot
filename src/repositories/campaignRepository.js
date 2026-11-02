const { randomUUID } = require('crypto');

const campaigns = [];
const contacts = [];

module.exports = {
    async createCampaign(campaignData) {
        const newCampaign = {
          id: randomUUID(),
          name: campaignData.name,
          messageTemplate: campaignData.messageTemplate,
          status: 'pending',
          createdAt: new Date()
        };
        campaigns.push(newCampaign);
        return newCampaign;
    },

    async addContacts(campaignId, contactsData) {
        const formattedContacts = contactsData.map(c => ({
          id: randomUUID(),
          campaignId,
          phone: c.phone,
          variables: c.variables || {},
          status: 'pending' 
        }));
        contacts.push(...formattedContacts);
        return formattedContacts;
    },

    async getCampaignById(id) {
        return campaigns.find(c => c.id === id || null);
    },

    async getContactsById(id) {
        return contacts.filter(c => c.id === id);
    }
}