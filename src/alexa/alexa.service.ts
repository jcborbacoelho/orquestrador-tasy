import { Injectable, Logger } from '@nestjs/common';
import { FileService } from 'src/file/file.service';
import { WatsonService } from 'src/watson/watson.service';
import { AlexaRequestDTO } from './dto/alexa-request-dto';
import { WatsonAssistantDto } from 'src/watson/dto/watsonAssistant.dto';

@Injectable()
export class AlexaService {
  private logger = new Logger('BrokerAlexaService');

  constructor(
    private readonly watsonService: WatsonService,
    private readonly fileService: FileService,
  ) {}

  async run(body: AlexaRequestDTO): Promise<string> {
    const watsonContext =
      await this.fileService.getWatsonContextItemFromJsonByCallerId(
        body.deviceId,
      );
    const watsonResponse: WatsonAssistantDto =
      await this.watsonService.sendAssistantMessageWithContext(
        watsonContext,
        body.deviceId,
        body.text,
      );
    const respostasWatson = watsonResponse.output.generic;
    if (respostasWatson.length === 0)
      return 'Não consegui obter uma resposta do servidor';
    if (respostasWatson[0].response_type == 'text')
      return respostasWatson.map((item) => item.text).join('.');
    if (respostasWatson[0].response_type == 'suggestion')
      return respostasWatson
        .map((item) => item.title)
        .join('.')
        .concat(
          respostasWatson
            .map((item) =>
              item.suggestions.map((suggestion) => suggestion.label).join('.'),
            )
            .join('.'),
        );
  }
}
