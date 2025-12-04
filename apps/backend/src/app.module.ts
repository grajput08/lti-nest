import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { LtiModule } from './lti/lti.module';
import { AppController } from './app.controller';
import { LtiMiddleware } from './lti/lti.middleware';

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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LtiMiddleware).forRoutes('*'); // 🔥 Middleware must catch all LTI routes
  }
}
