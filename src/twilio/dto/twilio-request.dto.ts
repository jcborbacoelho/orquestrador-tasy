import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class TwilioRequestDTO {
  @ApiProperty()
  NumMedia: string;

  @ApiProperty()
  ProfileName: string;

  @ApiProperty()
  WaId: string;

  @ApiProperty()
  Body: string;

  @ApiProperty({ description: 'numero da twilio' })
  To: string;

  @ApiProperty({ description: 'numero do usuario' })
  From: string;

  @ApiProperty()
  MediaUrl: string;

  @ApiProperty()
  AccountSid: string;

  @IsOptional()
  MediaContentType0?: string

  @IsOptional()
  MediaUrl0?: string

  @IsOptional()
  MessageSid?: string
}
