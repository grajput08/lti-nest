import { Module } from '@nestjs/common';
import { LtiService } from './lti.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LTIDatabaseModule } from './lti-database.module';

@Module({
  imports: [PrismaModule, LTIDatabaseModule],
  providers: [LtiService],
  exports: [LtiService],
})
export class LtiModule {}
