import { Response } from 'express';
import { getPersonalizedNews, getTrendingNews } from '../../src/controllers/newsController';
import { UserPreference } from '../../src/models/UserPreference';
import { AuthRequest } from '../../src/middlewares/authMiddleware';
import * as gnewsClient from '../../src/utils/gnewsClient';

// Mock dependencies
jest.mock('../../src/models/UserPreference');
jest.mock('../../src/utils/gnewsClient');

describe('News Controller', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    mockRequest = {};
    responseObject = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockResponse = responseObject;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPersonalizedNews', () => {
    it('should fetch personalized news based on user preferences', async () => {
      mockRequest.user = { _id: 'user123' } as any;

      const mockPreferences = {
        userId: 'user123',
        topics: ['technology', 'science'],
        language: 'en',
        country: 'us',
      };

      const mockNewsData = {
        totalArticles: 10,
        articles: [
          { title: 'Tech News 1', description: 'Description 1' },
          { title: 'Science News 1', description: 'Description 2' },
        ],
      };

      (UserPreference.findOne as jest.Mock).mockResolvedValue(mockPreferences);
      (gnewsClient.searchNews as jest.Mock).mockResolvedValue(mockNewsData);

      await getPersonalizedNews(mockRequest as AuthRequest, mockResponse as Response);

      expect(UserPreference.findOne).toHaveBeenCalledWith({ userId: 'user123' });
      expect(gnewsClient.searchNews).toHaveBeenCalledWith({
        q: 'technology OR science',
        lang: 'en',
        country: 'us',
        max: 10,
      });
      expect(responseObject.status).toHaveBeenCalledWith(200);
      expect(responseObject.json).toHaveBeenCalledWith({
        success: true,
        totalArticles: 10,
        articles: mockNewsData.articles,
        preferences: {
          topics: mockPreferences.topics,
          language: mockPreferences.language,
          country: mockPreferences.country,
        },
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await getPersonalizedNews(mockRequest as AuthRequest, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(401);
      expect(responseObject.json).toHaveBeenCalledWith({
        message: 'User not authenticated',
      });
    });

    it('should return 400 if user has no preferences', async () => {
      mockRequest.user = { _id: 'user123' } as any;

      (UserPreference.findOne as jest.Mock).mockResolvedValue(null);

      await getPersonalizedNews(mockRequest as AuthRequest, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(400);
      expect(responseObject.json).toHaveBeenCalledWith({
        message: 'Please set your preferences first before fetching news.',
      });
    });

    it('should return 400 if user has no topics in preferences', async () => {
      mockRequest.user = { _id: 'user123' } as any;

      const mockPreferences = {
        userId: 'user123',
        topics: [],
        language: 'en',
        country: 'us',
      };

      (UserPreference.findOne as jest.Mock).mockResolvedValue(mockPreferences);

      await getPersonalizedNews(mockRequest as AuthRequest, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(400);
      expect(responseObject.json).toHaveBeenCalledWith({
        message: 'Please add at least one topic to your preferences.',
      });
    });

    it('should return 429 if rate limit is exceeded', async () => {
      mockRequest.user = { _id: 'user123' } as any;

      const mockPreferences = {
        userId: 'user123',
        topics: ['technology'],
        language: 'en',
        country: 'us',
      };

      (UserPreference.findOne as jest.Mock).mockResolvedValue(mockPreferences);
      (gnewsClient.searchNews as jest.Mock).mockRejectedValue(
        new Error('Rate limit exceeded')
      );

      await getPersonalizedNews(mockRequest as AuthRequest, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(429);
      expect(responseObject.json).toHaveBeenCalledWith({
        message: 'GNews API rate limit exceeded. Please try again later.',
        error: 'Rate limit exceeded',
      });
    });

    it('should return 500 on general error', async () => {
      mockRequest.user = { _id: 'user123' } as any;

      const mockPreferences = {
        userId: 'user123',
        topics: ['technology'],
        language: 'en',
        country: 'us',
      };

      (UserPreference.findOne as jest.Mock).mockResolvedValue(mockPreferences);
      (gnewsClient.searchNews as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      await getPersonalizedNews(mockRequest as AuthRequest, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        message: 'Failed to fetch news',
        error: 'Network error',
      });
    });
  });

  describe('getTrendingNews', () => {
    it('should fetch trending news with default parameters', async () => {
      mockRequest.query = {};

      const mockNewsData = {
        totalArticles: 20,
        articles: [
          { title: 'Trending News 1', description: 'Description 1' },
          { title: 'Trending News 2', description: 'Description 2' },
        ],
      };

      (gnewsClient.getTopHeadlines as jest.Mock).mockResolvedValue(mockNewsData);

      await getTrendingNews(mockRequest as AuthRequest, mockResponse as Response);

      expect(gnewsClient.getTopHeadlines).toHaveBeenCalledWith('en', undefined, 10);
      expect(responseObject.status).toHaveBeenCalledWith(200);
      expect(responseObject.json).toHaveBeenCalledWith({
        success: true,
        totalArticles: 20,
        articles: mockNewsData.articles,
      });
    });

    it('should fetch trending news with custom parameters', async () => {
      mockRequest.query = {
        lang: 'es',
        country: 'mx',
        max: '20',
      };

      const mockNewsData = {
        totalArticles: 15,
        articles: [{ title: 'News in Spanish', description: 'Description' }],
      };

      (gnewsClient.getTopHeadlines as jest.Mock).mockResolvedValue(mockNewsData);

      await getTrendingNews(mockRequest as AuthRequest, mockResponse as Response);

      expect(gnewsClient.getTopHeadlines).toHaveBeenCalledWith('es', 'mx', 20);
      expect(responseObject.status).toHaveBeenCalledWith(200);
    });

    it('should return 429 if rate limit is exceeded', async () => {
      mockRequest.query = {};

      (gnewsClient.getTopHeadlines as jest.Mock).mockRejectedValue(
        new Error('Rate limit exceeded')
      );

      await getTrendingNews(mockRequest as AuthRequest, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(429);
      expect(responseObject.json).toHaveBeenCalledWith({
        message: 'GNews API rate limit exceeded. Please try again later.',
        error: 'Rate limit exceeded',
      });
    });

    it('should return 500 on general error', async () => {
      mockRequest.query = {};

      (gnewsClient.getTopHeadlines as jest.Mock).mockRejectedValue(
        new Error('API error')
      );

      await getTrendingNews(mockRequest as AuthRequest, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        message: 'Failed to fetch trending news',
        error: 'API error',
      });
    });
  });
});
