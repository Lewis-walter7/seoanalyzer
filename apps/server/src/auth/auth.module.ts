import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { AdminGuard } from './admin.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller'; // <- missing import
import { ConfigModule } from '@nestjs/config'

@Global()
@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController], // <- missing
  providers: [AuthGuard, AdminGuard, AuthService], // <- AuthService was missing
  exports: [AuthGuard, AdminGuard, JwtModule, AuthService],
})
export class AuthModule {}
