import mongoose from 'mongoose';
import { User, IUser } from '../User';

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        taxpayerId: 'TAX123456',
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe('test@example.com');
      expect(savedUser.name).toBe('Test User');
      expect(savedUser.taxpayerId).toBe('TAX123456');
      // パスワードはハッシュ化されているため、元の値と異なる
      expect(savedUser.password).not.toBe('password123');
    });

    it('should auto-lowercase email', async () => {
      const userData = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
        name: 'Test User',
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.email).toBe('test@example.com');
    });

    it('should hash password before saving', async () => {
      const userData = {
        email: 'hash@example.com',
        password: 'plainPassword123',
        name: 'Hash Test',
      };

      const user = new User(userData);
      const savedUser = await user.save();

      // パスワードは保存されるとハッシュ化される
      expect(savedUser.password).not.toBe('plainPassword123');
      expect(savedUser.password).toBeDefined();
    });

    it('should require email', async () => {
      const userData = {
        password: 'password123',
        name: 'Test User',
      };

      const user = new User(userData);

      try {
        await user.save();
        fail('Should have thrown a validation error');
      } catch (error: any) {
        expect(error.message).toContain('email');
      }
    });

    it('should require password', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const user = new User(userData);

      try {
        await user.save();
        fail('Should have thrown a validation error');
      } catch (error: any) {
        expect(error.message).toContain('password');
      }
    });

    it('should require name', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = new User(userData);

      try {
        await user.save();
        fail('Should have thrown a validation error');
      } catch (error: any) {
        expect(error.message).toContain('name');
      }
    });

    it('should enforce minimum password length', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'pass', // 4文字（最小6文字）
        name: 'Test User',
      };

      const user = new User(userData);

      try {
        await user.save();
        fail('Should have thrown a validation error');
      } catch (error: any) {
        expect(error.message).toContain('password');
      }
    });

    it('should enforce email uniqueness', async () => {
      const email = 'unique@example.com';

      // 最初のユーザーを保存
      const user1 = new User({
        email,
        password: 'password123',
        name: 'User 1',
      });
      await user1.save();

      // 同じメールアドレスで2番目のユーザーを保存しようとする
      const user2 = new User({
        email,
        password: 'password123',
        name: 'User 2',
      });

      try {
        await user2.save();
        fail('Should have thrown a duplicate key error');
      } catch (error: any) {
        expect(error.code).toBe(11000); // MongoDB duplicate key error
      }
    });

    it('should enforce taxpayerId uniqueness', async () => {
      const taxpayerId = 'UNIQUE_TAX_ID';

      // 最初のユーザーを保存
      const user1 = new User({
        email: 'user1@example.com',
        password: 'password123',
        name: 'User 1',
        taxpayerId,
      });
      await user1.save();

      // 同じtaxpayerIdで2番目のユーザーを保存しようとする
      const user2 = new User({
        email: 'user2@example.com',
        password: 'password123',
        name: 'User 2',
        taxpayerId,
      });

      try {
        await user2.save();
        fail('Should have thrown a duplicate key error');
      } catch (error: any) {
        expect(error.code).toBe(11000);
      }
    });
  });

  describe('comparePassword Method', () => {
    it('should return true for correct password', async () => {
      const userData = {
        email: 'password@example.com',
        password: 'correctPassword123',
        name: 'Password Test',
      };

      const user = new User(userData);
      const savedUser = await user.save();

      const isMatch = await savedUser.comparePassword('correctPassword123');
      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const userData = {
        email: 'password@example.com',
        password: 'correctPassword123',
        name: 'Password Test',
      };

      const user = new User(userData);
      const savedUser = await user.save();

      const isMatch = await savedUser.comparePassword('wrongPassword123');
      expect(isMatch).toBe(false);
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt and updatedAt timestamps', async () => {
      const userData = {
        email: 'timestamp@example.com',
        password: 'password123',
        name: 'Timestamp Test',
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
      expect(savedUser.createdAt instanceof Date).toBe(true);
      expect(savedUser.updatedAt instanceof Date).toBe(true);
    });
  });

  describe('User Queries', () => {
    it('should find user by email', async () => {
      const email = 'findme@example.com';
      const userData = {
        email,
        password: 'password123',
        name: 'Find Me User',
      };

      const user = new User(userData);
      await user.save();

      const foundUser = await User.findOne({ email });

      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe(email);
      expect(foundUser?.name).toBe('Find Me User');
    });

    it('should find user by taxpayerId', async () => {
      const taxpayerId = 'FIND_TAX_ID';
      const userData = {
        email: 'findtax@example.com',
        password: 'password123',
        name: 'Find Tax User',
        taxpayerId,
      };

      const user = new User(userData);
      await user.save();

      const foundUser = await User.findOne({ taxpayerId });

      expect(foundUser).toBeDefined();
      expect(foundUser?.taxpayerId).toBe(taxpayerId);
    });
  });
});
