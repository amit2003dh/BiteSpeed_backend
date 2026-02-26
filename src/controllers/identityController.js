const Joi = require('joi');
const identityService = require('../services/identityService');
const logger = require('../utils/logger');

const identifySchema = Joi.object({
  email: Joi.string().email().optional().allow(''),
  phoneNumber: Joi.string().pattern(/^\d+$/).optional().allow('')
}).or('email', 'phoneNumber');

class IdentityController {
  async identify(req, res) {
    try {
      const { error, value } = identifySchema.validate(req.body);
      
      if (error) {
        logger.warn('Validation error', { error: error.details[0].message, body: req.body });
        return res.status(400).json({
          error: 'Validation failed',
          details: error.details[0].message
        });
      }

      const { email, phoneNumber } = value;
      const result = await identityService.identifyUser(
        email || null, 
        phoneNumber || null
      );

      logger.info('Identity reconciliation successful', { 
        email, 
        phoneNumber, 
        primaryId: result.primaryContatctId 
      });

      res.status(200).json({ contact: result });

    } catch (error) {
      logger.error('Controller error in identify', { 
        error: error.message, 
        stack: error.stack,
        body: req.body 
      });

      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }

  async healthCheck(req, res) {
    try {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'identity-reconciliation'
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        error: error.message
      });
    }
  }
}

module.exports = new IdentityController();
