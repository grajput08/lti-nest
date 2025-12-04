import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { LtiModule } from './lti/lti.module';

@Module({
  imports: [PrismaModule, LtiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
