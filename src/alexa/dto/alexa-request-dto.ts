import { ApiProperty } from '@nestjs/swagger';

export class AlexaRequestDTO {
  @ApiProperty({ description: 'id do dispositivo da alexa' })
  deviceId: string;

  @ApiProperty({ description: 'comando de voz enviado e transcrito da alexa' })
  text: string;
}
