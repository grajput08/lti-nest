import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { LTIDatabaseService } from './lti-database.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [LTIDatabaseService],
  exports: [LTIDatabaseService],
})
export class LTIDatabaseModule {}
