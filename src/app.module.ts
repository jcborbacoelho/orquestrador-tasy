import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TwilioModule } from './twilio/twilio.module';
import { ConfigModule } from '@nestjs/config';
import { WatsonModule } from './watson/watson.module';
import { FileModule } from './file/file.module';
import { AlexaModule } from './alexa/alexa.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TwilioModule,
    WatsonModule,
    FileModule,
    AlexaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
