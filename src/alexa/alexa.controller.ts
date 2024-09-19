import { Body, Controller, Post } from '@nestjs/common';
import { AlexaService } from './alexa.service';
import { AlexaRequestDTO } from './dto/alexa-request-dto';

@Controller('alexa')
export class AlexaController {
  constructor(private readonly alexaService: AlexaService) {}

  @Post('message')
  async twilio(@Body() body: AlexaRequestDTO): Promise<any> {
    return await this.alexaService.run(body);
  }
}
