const campaignRepository = require('../repositories/campaignRepository');

const processedEvents = new Set();

const statusHierarchy = {
  'pending': 0,
  'sent': 1,
  'delivered': 2,
  'read': 3,
  'failed': 0
};

module.exports = {
    async processWebhook(data) {
        const { event_id, provider_message_id, status } = data;

        if (processedEvents.has(event_id)) {
            return { message: 'Evento duplicado já processado anteriormente' };
        }

        const contact = await campaignRepository.getContactByProviderMessageId(provider_message_id);

        if (!contact) {
            return { message: 'Contato não encontrado para o provider_message_id informado' };
        }

        const currentWeight = statusHierarchy[contact.status] || 0;
        const incomingWeight = statusHierarchy[status] || 0;

        if (incomingWeight >= currentWeight || status === 'failed') {
          contact.status = status;
        }

        processedEvents.add(event_id);

        return { 
          message: 'Webhook processado com sucesso', 
          contactId: contact.id, 
          currentStatus: contact.status 
        };
    }
};