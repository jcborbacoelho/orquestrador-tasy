import { Module } from '@nestjs/common';
import { TwilioController } from './twilio.controller';
import { TwilioService } from './twilio.service';
import { WatsonModule } from 'src/watson/watson.module';
import { FileModule } from 'src/file/file.module';

@Module({
  imports: [WatsonModule, FileModule],
  controllers: [TwilioController],
  providers: [TwilioService],
})
export class TwilioModule {}
