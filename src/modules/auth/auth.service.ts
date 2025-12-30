import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../../config/config.service';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto';
import { LoginResponse, TokenResponse } from './dto/auth-response.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: AppConfigService,
  ) {}

  /**
   * User login with email and password
   */
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    // Find user by email
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.usersService.updateLastLogin(user._id.toString());

    // Generate tokens
    const tokens = await this.generateTokens(
      user._id.toString(),
      user.email,
      user.role,
    );

    // Get user without password
    const userResponse = await this.usersService.findOne(user._id.toString());

    return {
      ...tokens,
      user: userResponse,
    };
  }

  /**
   * User registration
   */
  async register(registerDto: RegisterDto): Promise<LoginResponse> {
    // Validate password confirmation if provided
    if (
      registerDto.confirmPassword &&
      registerDto.password !== registerDto.confirmPassword
    ) {
      throw new BadRequestException('Passwords do not match');
    }

    // Remove confirmPassword before creating user
    const { confirmPassword, ...createUserDto } = registerDto;

    // Create user (password will be hashed by schema hook)
    const user = await this.usersService.create(createUserDto);

    // Generate tokens
    const tokens = await this.generateTokens(
      user._id,
      user.email,
      user.role,
    );

    return {
      ...tokens,
      user,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenResponse> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify<JwtPayload>(
        refreshTokenDto.refreshToken,
        {
          secret: this.configService.jwtRefreshSecret,
        },
      );

      // Generate new tokens
      return this.generateTokens(payload.sub, payload.email, payload.role);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Logout user (client should remove tokens)
   */
  async logout(): Promise<{ message: string }> {
    // In a stateless JWT system, logout is handled client-side
    // For token blacklisting, implement Redis-based token storage
    return { message: 'Logged out successfully' };
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<TokenResponse> {
    const payload = {
      sub: userId,
      email,
      role,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.jwtRefreshSecret,
      expiresIn: (this.configService.jwtRefreshExpiration || '7d') as any,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
