const campaignService = require('../src/services/campaignService');
const campaignRepository = require('../src/repositories/campaignRepository');
const fakeProvider = require('../src/providers/fakeProvider');

jest.mock('../src/repositories/campaignRepository');
jest.mock('../src/providers/fakeProvider');

describe('CampaignService Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Should create a campaign successfully', async () => {
        const inputData = {
            name: 'Campanha Teste',
            messageTemplate: 'Olá {{nome}}',
            contacts: [{ phone: '11999999999', variables: { nome: 'Leonardo' } }]
        };

        campaignRepository.createCampaign.mockResolvedValue({ id: '123', ...inputData });
        campaignRepository.addContacts.mockResolvedValue([{ id: 'c1', campaignId: '123', phone: '11999999999' }]);

        const result = await campaignService.createCampaign(inputData);

        expect(result).toHaveProperty('campaign');
        expect(result.totalContacts).toBe(1);
        expect(campaignRepository.createCampaign).toHaveBeenCalledTimes(1);
    });

    test('Should dispatch campaign and handle error', async () => {
        const mockCampaign = { id: '123', name: 'Teste', messageTemplate: 'Olá', status: 'pending' };
        const mockContacts = [{ id: 'c1', campaignId: '123', phone: '11777770000', variables: {} }];

        campaignRepository.getCampaignById.mockResolvedValue(mockCampaign);
        campaignRepository.getContactsById.mockResolvedValue(mockContacts);
        
        const error = new Error('invalid_number');
        error.status = 400;
        fakeProvider.sendMessage.mockRejectedValue(error);

        const result = await campaignService.startCampaign('123');

        expect(result).toHaveProperty('message');
        expect(campaignRepository.updateContactDispatchResult).toHaveBeenCalledWith(
            'c1',
            'failed',
            null,
            'invalid_number'
        );
    });
});