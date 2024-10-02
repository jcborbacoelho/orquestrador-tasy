import { Body, Controller, Post } from '@nestjs/common';
import { AlexaService } from './alexa.service';
import { AlexaRequestDTO } from './dto/alexa-request-dto';

@Controller('alexa')
export class AlexaController {
  constructor(private readonly alexaService: AlexaService) {}

  @Post('message')
  async alexa(@Body() body: AlexaRequestDTO): Promise<any> {
    return { message: await this.alexaService.run(body) };
  }
}
