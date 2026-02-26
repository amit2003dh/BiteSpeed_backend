const request = require('supertest');
const app = require('../src/app');
const sequelize = require('../src/config/database');
const Contact = require('../src/models/Contact');

describe('Identity Reconciliation API', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await Contact.destroy({ where: {}, force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/identify', () => {
    test('should create new primary contact for new user', async () => {
      const response = await request(app)
        .post('/api/identify')
        .send({
          email: 'test@example.com',
          phoneNumber: '1234567890'
        });

      expect(response.status).toBe(200);
      expect(response.body.contact.primaryContatctId).toBeDefined();
      expect(response.body.contact.emails).toContain('test@example.com');
      expect(response.body.contact.phoneNumbers).toContain('1234567890');
      expect(response.body.contact.secondaryContactIds).toEqual([]);
    });

    test('should link contacts with same email', async () => {
      await request(app)
        .post('/api/identify')
        .send({
          email: 'test@example.com',
          phoneNumber: '1234567890'
        });

      const response = await request(app)
        .post('/api/identify')
        .send({
          email: 'test@example.com',
          phoneNumber: '0987654321'
        });

      expect(response.status).toBe(200);
      expect(response.body.contact.emails).toContain('test@example.com');
      expect(response.body.contact.phoneNumbers).toContain('1234567890');
      expect(response.body.contact.phoneNumbers).toContain('0987654321');
      expect(response.body.contact.secondaryContactIds.length).toBe(1);
    });

    test('should link contacts with same phone number', async () => {
      await request(app)
        .post('/api/identify')
        .send({
          email: 'test1@example.com',
          phoneNumber: '1234567890'
        });

      const response = await request(app)
        .post('/api/identify')
        .send({
          email: 'test2@example.com',
          phoneNumber: '1234567890'
        });

      expect(response.status).toBe(200);
      expect(response.body.contact.emails).toContain('test1@example.com');
      expect(response.body.contact.emails).toContain('test2@example.com');
      expect(response.body.contact.phoneNumbers).toContain('1234567890');
      expect(response.body.contact.secondaryContactIds.length).toBe(1);
    });

    test('should merge two primary clusters', async () => {
      await request(app)
        .post('/api/identify')
        .send({
          email: 'test1@example.com',
          phoneNumber: '1234567890'
        });

      await request(app)
        .post('/api/identify')
        .send({
          email: 'test2@example.com',
          phoneNumber: '0987654321'
        });

      const response = await request(app)
        .post('/api/identify')
        .send({
          email: 'test1@example.com',
          phoneNumber: '0987654321'
        });

      expect(response.status).toBe(200);
      expect(response.body.contact.emails).toContain('test1@example.com');
      expect(response.body.contact.emails).toContain('test2@example.com');
      expect(response.body.contact.phoneNumbers).toContain('1234567890');
      expect(response.body.contact.phoneNumbers).toContain('0987654321');
      expect(response.body.contact.secondaryContactIds.length).toBe(2);
    });

    test('should handle email only request', async () => {
      const response = await request(app)
        .post('/api/identify')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.contact.emails).toContain('test@example.com');
    });

    test('should handle phone only request', async () => {
      const response = await request(app)
        .post('/api/identify')
        .send({
          phoneNumber: '1234567890'
        });

      expect(response.status).toBe(200);
      expect(response.body.contact.phoneNumbers).toContain('1234567890');
    });

    test('should return validation error for missing both fields', async () => {
      const response = await request(app)
        .post('/api/identify')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    test('should return validation error for invalid email', async () => {
      const response = await request(app)
        .post('/api/identify')
        .send({
          email: 'invalid-email',
          phoneNumber: '1234567890'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/health', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });
  });
});
