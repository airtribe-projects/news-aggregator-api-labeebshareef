import request from 'supertest';
import express from 'express';
import newsRoutes from '../../src/routes/newsRoutes';
import { User } from '../../src/models/User';
import { UserPreference } from '../../src/models/UserPreference';
import { generateToken } from '../../src/utils/jwt';
import * as gnewsClient from '../../src/utils/gnewsClient';

// Mock the gnewsClient
jest.mock('../../src/utils/gnewsClient');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/news', newsRoutes);

describe('News Routes Integration Tests', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Create a test user and get token
    const user = await User.create({
      email: 'newstest@example.com',
      password: 'Password123!',
    });
    userId = (user._id as any).toString();
    authToken = generateToken(userId);
  });

  describe('GET /api/news', () => {
    it('should fetch personalized news with valid token and preferences', async () => {
      // Create user preferences
      await UserPreference.create({
        userId,
        topics: ['technology', 'science'],
        language: 'en',
        country: 'us',
      });

      const mockNewsData = {
        totalArticles: 10,
        articles: [
          { title: 'Tech News', description: 'Description' },
        ],
      };

      (gnewsClient.searchNews as jest.Mock).mockResolvedValue(mockNewsData);

      const response = await request(app)
        .get('/api/news')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('totalArticles', 10);
      expect(response.body).toHaveProperty('articles');
      expect(response.body).toHaveProperty('preferences');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/news')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authorized, no token');
    });

    it('should return 400 when user has no preferences', async () => {
      const response = await request(app)
        .get('/api/news')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/news/trending', () => {
    it('should fetch trending news with valid token', async () => {
      const mockNewsData = {
        totalArticles: 20,
        articles: [
          { title: 'Trending News', description: 'Description' },
        ],
      };

      (gnewsClient.getTopHeadlines as jest.Mock).mockResolvedValue(mockNewsData);

      const response = await request(app)
        .get('/api/news/trending')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('totalArticles', 20);
      expect(response.body).toHaveProperty('articles');
    });

    it('should fetch trending news with custom parameters', async () => {
      const mockNewsData = {
        totalArticles: 15,
        articles: [{ title: 'News', description: 'Desc' }],
      };

      (gnewsClient.getTopHeadlines as jest.Mock).mockResolvedValue(mockNewsData);

      const response = await request(app)
        .get('/api/news/trending?lang=es&country=mx&max=15')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(gnewsClient.getTopHeadlines).toHaveBeenCalledWith('es', 'mx', 15);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/news/trending')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authorized, no token');
    });
  });
});
