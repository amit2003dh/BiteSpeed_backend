const { Op } = require('sequelize');
const Contact = require('../models/Contact');
const logger = require('../utils/logger');

class IdentityService {
  async identifyUser(email, phoneNumber) {
    logger.info('Processing identity request', { email, phoneNumber });

    try {
      const matchedContacts = await this.findMatchingContacts(email, phoneNumber);

      if (matchedContacts.length === 0) {
        logger.info('No existing contacts found, creating new primary');
        return await this.createNewPrimary(email, phoneNumber);
      }

      const primaryContact = await this.getOldestPrimary(matchedContacts);
      await this.normalizeCluster(matchedContacts, primaryContact);

      const exactMatchExists = await this.checkExactMatch(email, phoneNumber, primaryContact.id);
      if (!exactMatchExists) {
        await this.createSecondary(email, phoneNumber, primaryContact.id);
      }

      return await this.buildResponse(primaryContact.id);

    } catch (error) {
      logger.error('Error in identity reconciliation', { error: error.message, email, phoneNumber });
      throw error;
    }
  }

  async findMatchingContacts(email, phoneNumber) {
    const whereConditions = [];

    if (email) {
      whereConditions.push({ email });
    }
    if (phoneNumber) {
      whereConditions.push({ phoneNumber });
    }

    return await Contact.findAll({
      where: {
        [Op.or]: whereConditions,
        deletedAt: null
      },
      order: [['createdAt', 'ASC']]
    });
  }

  async getOldestPrimary(contacts) {
    const primaryContacts = contacts.filter(contact => contact.linkPrecedence === 'primary');
    
    if (primaryContacts.length > 0) {
      return primaryContacts[0];
    }

    const oldestContact = contacts[0];
    await oldestContact.update({ linkPrecedence: 'primary', linkedId: null });
    return oldestContact;
  }

  async normalizeCluster(contacts, primaryContact) {
    const primaryContacts = contacts.filter(contact => contact.linkPrecedence === 'primary');
    
    for (const contact of primaryContacts) {
      if (contact.id !== primaryContact.id) {
        await contact.update({
          linkPrecedence: 'secondary',
          linkedId: primaryContact.id
        });

        await Contact.update(
          { linkedId: primaryContact.id },
          {
            where: {
              linkedId: contact.id,
              deletedAt: null
            }
          }
        );
      }
    }

    const secondaryContacts = contacts.filter(contact => 
      contact.linkPrecedence === 'secondary' && contact.linkedId !== primaryContact.id
    );

    for (const contact of secondaryContacts) {
      await contact.update({ linkedId: primaryContact.id });
    }
  }

  async checkExactMatch(email, phoneNumber, primaryId) {
    const whereCondition = {
      linkedId: primaryId,
      deletedAt: null
    };

    if (email) whereCondition.email = email;
    if (phoneNumber) whereCondition.phoneNumber = phoneNumber;

    const existingContact = await Contact.findOne({
      where: whereCondition
    });

    return !!existingContact;
  }

  async createNewPrimary(email, phoneNumber) {
    const newContact = await Contact.create({
      email,
      phoneNumber,
      linkPrecedence: 'primary'
    });

    return await this.buildResponse(newContact.id);
  }

  async createSecondary(email, phoneNumber, primaryId) {
    await Contact.create({
      email,
      phoneNumber,
      linkedId: primaryId,
      linkPrecedence: 'secondary'
    });
  }

  async buildResponse(primaryId) {
    const primaryContact = await Contact.findOne({
      where: { id: primaryId, deletedAt: null }
    });

    if (!primaryContact) {
      throw new Error('Primary contact not found');
    }

    const allRelatedContacts = await Contact.findAll({
      where: {
        [Op.or]: [
          { id: primaryId },
          { linkedId: primaryId }
        ],
        deletedAt: null
      }
    });

    const emails = [...new Set(allRelatedContacts
      .map(contact => contact.email)
      .filter(email => email))];

    const phoneNumbers = [...new Set(allRelatedContacts
      .map(contact => contact.phoneNumber)
      .filter(phone => phone))];

    const secondaryContactIds = allRelatedContacts
      .filter(contact => contact.linkPrecedence === 'secondary')
      .map(contact => contact.id);

    return {
      primaryContatctId: primaryId,
      emails,
      phoneNumbers,
      secondaryContactIds
    };
  }
}

module.exports = new IdentityService();
