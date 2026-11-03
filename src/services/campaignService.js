const campaignRepository = require('../repositories/campaignRepository');
const { sendMessage } = require('../providers/fakeProvider');

module.exports = {
    async createCampaign(data) {
        const {name, messageTemplate, contacts} = data;

        const campaign = await campaignRepository.createCampaign({name, messageTemplate});
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
        if (!contacts) {
            throw new Error('Nenhum contato foi encontrado para a campanha');
        }

        campaign.status = "in progress";

        const dispatchCampaign = contacts.map(async (contact) => {
          try {
            let messageBody = campaign.messageTemplate;
            if (contact.variables) {
              for (const [key, value] of Object.entries(contact.variables)) {
                messageBody = messageBody.replace(new RegExp(`{{${key}}}`, 'g'), value);
              }
            }

            console.log(`Enviando campanha para ${contact.phone} | Mensagem: ${messageBody}`);

            const result = await sendMessage({
              to: contact.phone,
              body: messageBody
            });

            contact.status = 'sent';
            contact.providerMessageId = result.providerMessageId;

            console.log(`Mensagem enviada com sucesso Provider ID: ${result.providerMessageId}`);

          } catch (error) {
            console.log(`Erro ao enviar para ${contact.phone}:`, error.message);
            if (error.status === 400) {
              contact.status = 'failed';
              contact.failReason = error.message;
            } else if (error.status === 503) {
              contact.status = 'failed';
              contact.failReason = 'provider_unavailable';
            } else {
              contact.status = 'failed';
              contact.failReason = error.message;
            }
          }
        });

        await Promise.all(dispatchCampaign);

        campaign.status = 'done';
        return { message: `Disparo de campanha ${campaignId} finalizado`};
    }
};