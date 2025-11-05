import { Request, Response } from 'express';
import { signup, login, getProfile } from '../../src/controllers/authController';
import { User } from '../../src/models/User';
import { generateToken } from '../../src/utils/jwt';

// Mock dependencies
jest.mock('../../src/models/User');
jest.mock('../../src/utils/jwt');

describe('Auth Controller', () => {
  let mockRequest: Partial<Request> & { user?: any };
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

  describe('signup', () => {
    it('should create a new user and return token', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (generateToken as jest.Mock).mockReturnValue('fake-token');

      await signup(mockRequest as Request, mockResponse as Response);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(User.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(generateToken).toHaveBeenCalledWith('user123');
      expect(responseObject.status).toHaveBeenCalledWith(201);
      expect(responseObject.json).toHaveBeenCalledWith({
        success: true,
        token: 'fake-token',
        user: { id: 'user123', email: 'test@example.com' },
      });
    });

    it('should return 400 if email is missing', async () => {
      mockRequest.body = {
        password: 'password123',
      };

      await signup(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(400);
      expect(responseObject.json).toHaveBeenCalledWith({
        message: 'Email and password required',
      });
    });

    it('should return 400 if password is missing', async () => {
      mockRequest.body = {
        email: 'test@example.com',
      };

      await signup(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(400);
      expect(responseObject.json).toHaveBeenCalledWith({
        message: 'Email and password required',
      });
    });

    it('should return 400 if user already exists', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      (User.findOne as jest.Mock).mockResolvedValue({ email: 'test@example.com' });

      await signup(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(400);
      expect(responseObject.json).toHaveBeenCalledWith({
        message: 'User already exists',
      });
    });
  });

  describe('login', () => {
    it('should login user and return token', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (generateToken as jest.Mock).mockReturnValue('fake-token');

      await login(mockRequest as Request, mockResponse as Response);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
      expect(generateToken).toHaveBeenCalledWith('user123');
      expect(responseObject.json).toHaveBeenCalledWith({
        success: true,
        token: 'fake-token',
        user: { id: 'user123', email: 'test@example.com' },
      });
    });

    it('should return 401 if user not found', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);

      await login(mockRequest as Request, mockResponse as Response);

      expect(responseObject.status).toHaveBeenCalledWith(401);
      expect(responseObject.json).toHaveBeenCalledWith({
        message: 'Invalid credentials',
      });
    });

    it('should return 401 if password is incorrect', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockUser.comparePassword).toHaveBeenCalledWith('wrongpassword');
      expect(responseObject.status).toHaveBeenCalledWith(401);
      expect(responseObject.json).toHaveBeenCalledWith({
        message: 'Invalid credentials',
      });
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
      };

      mockRequest.user = mockUser as any;

      await getProfile(mockRequest as Request, mockResponse as Response);

      expect(responseObject.json).toHaveBeenCalledWith(mockUser);
    });
  });
});
