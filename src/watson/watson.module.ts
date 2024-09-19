import { Module } from '@nestjs/common';
import { WatsonService } from './watson.service';
import { S3Service } from './s3/s3.service';

@Module({
  providers: [WatsonService, S3Service],
  exports: [WatsonService, S3Service],
})
export class WatsonModule {}
