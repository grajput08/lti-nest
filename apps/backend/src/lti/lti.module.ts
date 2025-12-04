import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LtiService } from './lti.service';
import { LtiDatabaseService } from './lti-database.service';
import { LtiController } from './lti.controller';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [LtiService, LtiDatabaseService],
  controllers: [LtiController],
  exports: [LtiService],
})
export class LtiModule {}
