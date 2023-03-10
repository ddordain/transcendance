import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './utils/local-strategy';
import { JwtModule } from '@nestjs/jwt';
import { refreshStrategy } from './utils/refresh-strategy';
import { accessStrategy } from './utils/access-strategy';
import { HttpModule } from '@nestjs/axios';
import { SocialsModule } from 'src/socials/socials.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    HttpModule,
    JwtModule.register({
      secret: process.env['AT_SECRET'],
      signOptions: {
        expiresIn: '20s',
      },
    }),
    SocialsModule,
  ],
  controllers: [AuthController],
  providers: [
    PrismaService,
    AuthService,
    LocalStrategy,
    refreshStrategy,
    accessStrategy,
  ],
})
export class AuthModule {}
