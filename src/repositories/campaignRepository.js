const { randomUUID } = require('crypto');
const db = require('../config/database');

module.exports = {
    async createCampaign(campaignData) {
        const id = randomUUID();
        const { name, messageTemplate } = campaignData;
        const status = 'pending';

        const query = `
            INSERT INTO campaigns (id, name, message_template, status)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, message_template AS "messageTemplate", status, created_at AS "createdAt";
        `;

        const values = [id, name, messageTemplate, status];
        const result = await db.query(query, values);
        return result.rows[0];
    },

    async addContacts(campaignId, contactsData) {
        const insertedContacts = [];

        for (const c of contactsData) {
            const id = randomUUID();
            const phone = c.phone;
            const variables = c.variables || {};
            const status = 'pending';

            const query = `
                INSERT INTO contacts (id, campaign_id, phone, variables, status, provider_message_id, failReason)
                VALUES ($1, $2, $3, $4, $5, NULL, NULL)
                RETURNING id, campaign_id AS "campaignId", phone, variables, status, provider_message_id AS "providerMessageId", failReason;
            `;

            const values = [id, campaignId, phone, JSON.stringify(variables), status];
            const result = await db.query(query, values);
            insertedContacts.push(result.rows[0]);
        }

        return insertedContacts;
    },

    async getCampaignById(id) {
        const query = `
            SELECT id, name, message_template AS "messageTemplate", status, created_at AS "createdAt"
            FROM campaigns WHERE id = $1;
        `;
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    },

    async getContactsById(campaignId) {
        const query = `
            SELECT id, campaign_id AS "campaignId", phone, variables, status, provider_message_id AS "providerMessageId", failReason
            FROM contacts WHERE campaign_id = $1;
        `;
        const result = await db.query(query, [campaignId]);
        return result.rows;
    },

    async getContactByProviderMessageId(providerMessageId) {
        const query = `
            SELECT id, campaign_id AS "campaignId", phone, variables, status, provider_message_id AS "providerMessageId", failReason
            FROM contacts WHERE provider_message_id = $1;
        `;
        const result = await db.query(query, [providerMessageId]);
        return result.rows[0] || null;
    },

    async updateCampaignStatus(campaignId, status) {
        const query = `UPDATE campaigns SET status = $1 WHERE id = $2;`;
        await db.query(query, [status, campaignId]);
    },

    async updateContactDispatchResult(contactId, status, providerMessageId, failReason) {
        const query = `
            UPDATE contacts 
            SET status = $1, provider_message_id = $2, failReason = $3
            WHERE id = $4;
        `;
        await db.query(query, [status, providerMessageId, failReason, contactId]);
    },

    async updateContactStatus(contactId, status) {
        const query = `
            UPDATE contacts 
            SET status = $1 
            WHERE id = $2;
        `;
        await db.query(query, [status, contactId]);
    }
};