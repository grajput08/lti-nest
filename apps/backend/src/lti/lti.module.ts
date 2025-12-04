import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LtiService } from './lti.service';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [LtiService],
  exports: [LtiService],
})
export class LtiModule {}
