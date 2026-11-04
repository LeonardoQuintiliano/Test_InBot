const webhookService = require('../src/services/webhookService');
const campaignRepository = require('../src/repositories/campaignRepository');

jest.mock('../src/repositories/campaignRepository');

describe('WebhookService Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Should successfully update the status', async () => {
        const webhookPayload = {
            event_id: 'evt_unit_01',
            provider_message_id: 'pm_test_123',
            status: 'delivered'
        };

        const mockContact = {
            id: 'c1',
            campaignId: '123',
            status: 'sent',
            provider_message_id: 'pm_test_123'
        };

        campaignRepository.getContactByProviderMessageId.mockResolvedValue(mockContact);

        const result = await webhookService.processWebhook(webhookPayload);

        expect(result.message).toBe('Webhook processado com sucesso');
        expect(result.currentStatus).toBe('delivered');
        expect(campaignRepository.updateContactStatus).toHaveBeenCalledWith('c1', 'delivered');
    });

    test('Should reject invalid status', async () => {
        const webhookPayload = {
            event_id: 'evt_unit_02',
            provider_message_id: 'pm_test_123',
            status: 'status_maluco'
        };

        await expect(webhookService.processWebhook(webhookPayload)).rejects.toThrow('Status de webhook inválido');
    });
});