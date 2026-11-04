const campaignRepository = require('../repositories/campaignRepository');
const { sendMessage } = require('../providers/fakeProvider');

module.exports = {
    async createCampaign(data) {
        const { name, messageTemplate, contacts } = data;

        const campaign = await campaignRepository.createCampaign({ name, messageTemplate });
        const contactsData = await campaignRepository.addContacts(campaign.id, contacts);

        return {
            campaign,
            totalContacts: contactsData.length
        };
    },

    async startCampaign(campaignId) {
        const campaign = await campaignRepository.getCampaignById(campaignId);
        if (!campaign) {
            throw new Error('Campanha não encontrada');
        }

        const contacts = await campaignRepository.getContactsById(campaignId);
        if (!contacts || contacts.length === 0) {
            throw new Error('Nenhum contato foi encontrado para a campanha');
        }

        await campaignRepository.updateCampaignStatus(campaignId, 'in progress');

        const dispatchCampaign = contacts.map(async (contact) => {
            try {
                let messageBody = campaign.messageTemplate;
                if (contact.variables) {
                    const vars = typeof contact.variables === 'string' ? JSON.parse(contact.variables) : contact.variables;
                    for (const [key, value] of Object.entries(vars)) {
                        messageBody = messageBody.replace(new RegExp(`{{${key}}}`, 'g'), value);
                    }
                }

                console.log(`Enviando campanha para ${contact.phone} | Mensagem: ${messageBody}`);

                const result = await sendMessage({
                    to: contact.phone,
                    body: messageBody
                });

                await campaignRepository.updateContactDispatchResult(
                    contact.id,
                    'sent',
                    result.providerMessageId,
                    null
                );

                console.log(`Mensagem enviada com sucesso Provider ID: ${result.providerMessageId}`);

            } catch (error) {
                console.log(`Erro ao enviar para ${contact.phone}:`, error.message);
                let failReason = error.message;
                if (error.status === 503) {
                    failReason = 'provider_unavailable';
                }

                await campaignRepository.updateContactDispatchResult(
                    contact.id,
                    'failed',
                    null,
                    failReason
                );
            }
        });

        await Promise.all(dispatchCampaign);

        await campaignRepository.updateCampaignStatus(campaignId, 'done');

        return { message: `Disparo de campanha ${campaignId} finalizado` };
    }
};