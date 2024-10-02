import { Module } from '@nestjs/common';
import { AlexaService } from './alexa.service';
import { AlexaController } from './alexa.controller';
import { WatsonModule } from 'src/watson/watson.module';
import { FileModule } from 'src/file/file.module';

@Module({
  imports: [WatsonModule, FileModule],
  providers: [AlexaService],
  controllers: [AlexaController],
})
export class AlexaModule {}
