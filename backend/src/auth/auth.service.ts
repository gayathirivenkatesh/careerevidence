import { UserRole, type PrismaClient } from '@prisma/client';
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
} from './auth.types.js';
import { hashPassword, verifyPassword } from './password.service.js';
import { createAccessToken } from './jwt.service.js';

export class AuthService {
  constructor(private readonly prisma: PrismaClient) {}

  async register(input: RegisterInput): Promise<AuthResponse> {
    const email = input.email.trim().toLowerCase();
    const name = input.name.trim();

    if (!email) {
      throw new Error('INVALID_EMAIL');
    }

    if (!name) {
      throw new Error('INVALID_NAME');
    }

    if (input.password.length < 8) {
      throw new Error('PASSWORD_TOO_SHORT');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: UserRole.STUDENT,
      },
    });

    const token = createAccessToken({
      sub: user.id,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const email = input.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const validPassword = await verifyPassword(
      input.password,
      user.passwordHash,
    );

    if (!validPassword) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const token = createAccessToken({
      sub: user.id,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }
}