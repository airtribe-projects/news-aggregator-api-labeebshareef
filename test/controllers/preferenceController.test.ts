import { Response } from 'express';
import { savePreferences, getPreferences } from '../../src/controllers/preferenceController';
import { UserPreference } from '../../src/models/UserPreference';
import { AuthRequest } from '../../src/middlewares/authMiddleware';

// Mock dependencies
jest.mock('../../src/models/UserPreference');

describe('Preference Controller', () => {
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

  describe('savePreferences', () => {
    it('should create new preferences for user', async () => {
      mockRequest.user = { _id: 'user123' } as any;
      mockRequest.body = {
        topics: ['technology', 'science'],
        language: 'en',
        country: 'us',
        sources: ['bbc', 'cnn'],
      };

      const mockPreference = {
        userId: 'user123',
        topics: ['technology', 'science'],
        language: 'en',
        country: 'us',
        sources: ['bbc', 'cnn'],
      };

      (UserPreference.findOne as jest.Mock).mockResolvedValue(null);
      (UserPreference.create as jest.Mock).mockResolvedValue(mockPreference);

      await savePreferences(mockRequest as AuthRequest, mockResponse as Response);

      expect(UserPreference.findOne).toHaveBeenCalledWith({ userId: 'user123' });
      expect(UserPreference.create).toHaveBeenCalledWith({
        userId: 'user123',
        topics: ['technology', 'science'],
        language: 'en',
        country: 'us',
        sources: ['bbc', 'cnn'],
      });
      expect(responseObject.status).toHaveBeenCalledWith(200);
      expect(responseObject.json).toHaveBeenCalledWith({
        success: true,
        message: 'Preferences saved successfully',
        preferences: {
          topics: mockPreference.topics,
          language: mockPreference.language,
          country: mockPreference.country,
          sources: mockPreference.sources,
        },
      });
    });

    it('should update existing preferences for user', async () => {
      mockRequest.user = { _id: 'user123' } as any;
      mockRequest.body = {
        topics: ['technology', 'business'],
        language: 'es',
      };

      const existingPreference = {
        userId: 'user123',
        topics: ['science'],
        language: 'en',
        country: 'us',
        sources: [],
        save: jest.fn().mockResolvedValue(true),
      };

      (UserPreference.findOne as jest.Mock).mockResolvedValue(existingPreference);

      await savePreferences(mockRequest as AuthRequest, mockResponse as Response);

      expect(UserPreference.findOne).toHaveBeenCalledWith({ userId: 'user123' });
      expect(existingPreference.topics).toEqual(['technology', 'business']);
      expect(existingPreference.language).toBe('es');
      expect(existingPreference.save).toHaveBeenCalled();
      expect(responseObject.status).toHaveBeenCalledWith(200);
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;
      mockRequest.body = { topics: ['technology'] };

      await savePreferences(mockRequest as AuthRequest, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(401);
      expect(responseObject.json).toHaveBeenCalledWith({
        message: 'User not authenticated',
      });
    });

    it('should use default values when fields are not provided', async () => {
      mockRequest.user = { _id: 'user123' } as any;
      mockRequest.body = {};

      const mockPreference = {
        userId: 'user123',
        topics: [],
        language: 'en',
        country: 'us',
        sources: [],
      };

      (UserPreference.findOne as jest.Mock).mockResolvedValue(null);
      (UserPreference.create as jest.Mock).mockResolvedValue(mockPreference);

      await savePreferences(mockRequest as AuthRequest, mockResponse as Response);

      expect(UserPreference.create).toHaveBeenCalledWith({
        userId: 'user123',
        topics: [],
        language: 'en',
        country: 'us',
        sources: [],
      });
    });

    it('should return 500 on error', async () => {
      mockRequest.user = { _id: 'user123' } as any;
      mockRequest.body = { topics: ['technology'] };

      (UserPreference.findOne as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await savePreferences(mockRequest as AuthRequest, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        message: 'Failed to save preferences',
        error: 'Database error',
      });
    });
  });

  describe('getPreferences', () => {
    it('should return user preferences', async () => {
      mockRequest.user = { _id: 'user123' } as any;

      const mockPreference = {
        userId: 'user123',
        topics: ['technology', 'science'],
        language: 'en',
        country: 'us',
        sources: ['bbc'],
      };

      (UserPreference.findOne as jest.Mock).mockResolvedValue(mockPreference);

      await getPreferences(mockRequest as AuthRequest, mockResponse as Response);

      expect(UserPreference.findOne).toHaveBeenCalledWith({ userId: 'user123' });
      expect(responseObject.status).toHaveBeenCalledWith(200);
      expect(responseObject.json).toHaveBeenCalledWith({
        success: true,
        preferences: {
          topics: mockPreference.topics,
          language: mockPreference.language,
          country: mockPreference.country,
          sources: mockPreference.sources,
        },
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await getPreferences(mockRequest as AuthRequest, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(401);
      expect(responseObject.json).toHaveBeenCalledWith({
        message: 'User not authenticated',
      });
    });

    it('should return 404 if no preferences found', async () => {
      mockRequest.user = { _id: 'user123' } as any;

      (UserPreference.findOne as jest.Mock).mockResolvedValue(null);

      await getPreferences(mockRequest as AuthRequest, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(404);
      expect(responseObject.json).toHaveBeenCalledWith({
        message: 'No preferences found. Please set your preferences first.',
      });
    });

    it('should return 500 on error', async () => {
      mockRequest.user = { _id: 'user123' } as any;

      (UserPreference.findOne as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await getPreferences(mockRequest as AuthRequest, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({
        message: 'Failed to fetch preferences',
        error: 'Database error',
      });
    });
  });
});
