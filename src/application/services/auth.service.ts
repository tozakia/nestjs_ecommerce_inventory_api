import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { hash, compare } from 'bcryptjs';
import { UnitOfWork } from '@infrastructure/database/unit-of-work';
import { User } from '@domain/entities/user.entity';
import type { IUnitOfWork } from '@application/interfaces/unit-of-work.interface';
import { RegisterDto } from '@application/dtos/auth/register.dto';
import { LoginDto } from '@application/dtos/auth/login.dto';
import { AuthResponseDto } from '@application/dtos/auth/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UnitOfWork)
    private readonly unitOfWork: IUnitOfWork,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    try {
      const { email, username, password } = registerDto;

      // Check if user exists
      const existingEmail = await this.unitOfWork.users.findByEmail(email);
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }

      const existingUsername =
        await this.unitOfWork.users.findByUsername(username);
      if (existingUsername) {
        throw new ConflictException('Username already exists');
      }

      // Hash password
      const hashedPassword = await hash(password, 10);

      // Create user
      const user = await this.unitOfWork.users.create({
        email,
        username,
        password: hashedPassword,
      });

      if (!user) {
        throw new Error('Failed to create user');
      }

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Update refresh token
      await this.unitOfWork.users.updateRefreshToken(
        user.id,
        tokens.refreshToken,
      );

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to register user: ${errorMessage}`);
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    try {
      const { email, password } = loginDto;

      // Find user
      const user = await this.unitOfWork.users.findByEmail(email);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Update refresh token
      await this.unitOfWork.users.updateRefreshToken(
        user.id,
        tokens.refreshToken,
      );

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      };
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to login';
      throw new Error(`Login failed: ${errorMessage}`);
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify<{ sub: number }>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.unitOfWork.users.findById(payload.sub);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);
      await this.unitOfWork.users.updateRefreshToken(
        user.id,
        tokens.refreshToken,
      );

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      };
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('An unexpected error occurred');
    }
  }

  async logout(userId: number): Promise<void> {
    try {
      await this.unitOfWork.users.updateRefreshToken(userId, null);
    } catch (error) {
      console.error('Failed to update refresh token during logout:', error);
      throw new Error('Failed to complete logout');
    }
  }

  private async generateTokens(user: User) {
    try {
      const payload = { sub: user.id, username: user.username };

      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload, {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
        }),
        this.jwtService.signAsync(payload, {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>(
            'JWT_REFRESH_EXPIRES_IN',
            '7d',
          ),
        }),
      ]);

      if (!accessToken || !refreshToken) {
        throw new Error('Failed to generate tokens');
      }

      return {
        accessToken,
        refreshToken,
      };
    } catch (error: unknown) {
      console.error('Token generation error:', error);
      throw new Error('Failed to generate authentication tokens');
    }
  }
}
