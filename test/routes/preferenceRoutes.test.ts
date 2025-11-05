import request from 'supertest';
import express from 'express';
import preferenceRoutes from '../../src/routes/preferenceRoutes';
import { User } from '../../src/models/User';
import { UserPreference } from '../../src/models/UserPreference';
import { generateToken } from '../../src/utils/jwt';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/preferences', preferenceRoutes);

describe('Preference Routes Integration Tests', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Create a test user and get token
    const user = await User.create({
      email: 'preferencetest@example.com',
      password: 'Password123!',
    });
    userId = (user._id as any).toString();
    authToken = generateToken(userId);
  });

  describe('POST /api/preferences', () => {
    it('should create new preferences for user', async () => {
      const preferences = {
        topics: ['technology', 'science'],
        language: 'en',
        country: 'us',
        sources: ['bbc', 'cnn'],
      };

      const response = await request(app)
        .post('/api/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send(preferences)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Preferences saved successfully');
      expect(response.body).toHaveProperty('preferences');
      expect(response.body.preferences.topics).toEqual(preferences.topics);
      expect(response.body.preferences.language).toBe(preferences.language);

      // Verify in database
      const savedPrefs = await UserPreference.findOne({ userId });
      expect(savedPrefs).toBeTruthy();
      expect(savedPrefs?.topics).toEqual(preferences.topics);
    });

    it('should update existing preferences', async () => {
      // Create initial preferences
      await UserPreference.create({
        userId,
        topics: ['sports'],
        language: 'en',
        country: 'us',
      });

      const updatedPreferences = {
        topics: ['technology', 'business'],
        language: 'es',
      };

      const response = await request(app)
        .post('/api/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedPreferences)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.preferences.topics).toEqual(updatedPreferences.topics);
      expect(response.body.preferences.language).toBe(updatedPreferences.language);

      // Verify in database
      const savedPrefs = await UserPreference.findOne({ userId });
      expect(savedPrefs?.topics).toEqual(updatedPreferences.topics);
      expect(savedPrefs?.language).toBe(updatedPreferences.language);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/preferences')
        .send({ topics: ['technology'] })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authorized, no token');
    });
  });

  describe('GET /api/preferences', () => {
    it('should retrieve user preferences', async () => {
      const preferences = {
        userId,
        topics: ['technology', 'science'],
        language: 'en',
        country: 'us',
        sources: ['bbc'],
      };

      await UserPreference.create(preferences);

      const response = await request(app)
        .get('/api/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('preferences');
      expect(response.body.preferences.topics).toEqual(preferences.topics);
      expect(response.body.preferences.language).toBe(preferences.language);
      expect(response.body.preferences.country).toBe(preferences.country);
    });

    it('should return 404 when no preferences exist', async () => {
      const response = await request(app)
        .get('/api/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/preferences')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authorized, no token');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/preferences')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authorized, token failed');
    });
  });
});
