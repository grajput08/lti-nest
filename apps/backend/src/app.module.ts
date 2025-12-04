import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { LtiModule } from './lti/lti.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LtiModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
