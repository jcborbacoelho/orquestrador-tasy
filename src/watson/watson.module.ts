import { Module } from '@nestjs/common';
import { WatsonService } from './watson.service';

@Module({
  providers: [WatsonService],
  exports: [WatsonService],
})
export class WatsonModule {}
