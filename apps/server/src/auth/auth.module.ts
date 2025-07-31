import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { AdminGuard } from './admin.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config'

// Ensure JWT_SECRET is available and throw if missing
const secret = process.env.JWT_SECRET ?? (()=>{ throw new Error('JWT_SECRET missing')})();

@Global()
@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    JwtModule.register({
      global: true,
      secret,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthGuard, AdminGuard, AuthService],
  exports: [AuthGuard, AdminGuard, JwtModule, AuthService],
})
export class AuthModule {}
