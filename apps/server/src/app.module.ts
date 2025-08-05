import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from './prisma/prisma.module';
import { CrawlerModule } from './crawler/crawler.module';
import { AuthModule } from './auth/auth.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { ConfigModule } from '@nestjs/config'
import { ProjectsModule } from './projects/projects.module';
import { ToolsModule } from './tools/tools.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    PrismaModule,
    AuthModule,
    CrawlerModule,
    SubscriptionModule,
    ProjectsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ToolsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
