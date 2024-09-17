import { Injectable, Logger } from '@nestjs/common';
import { FileService } from 'src/file/file.service';
import { TextNormalizer } from 'src/helpers/common';
import { Constant } from 'src/helpers/constant';
import { WatsonService } from 'src/watson/watson.service';
import { Twilio } from 'twilio';

@Injectable()
export class TwilioService {
  private client: Twilio;
  private logger = new Logger('BrokerTwilioService');

  constructor(
    private readonly watsonService: WatsonService,
    private readonly fileService: FileService,
  ) {}

  async run(body): Promise<any> {
    try {
      this.logger.log('broker started');

      //colocar um try catch?
      const phoneNumber = body.To.replace(/\D/g, '');
      const userPhoneNumber = body.From.replace(/\D/g, '');
      const watsonContext = await this.fileService.getByPhoneNumber(
        userPhoneNumber,
      );

      this.client = new Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
      this.logger.log('credentials found:', `phone-number: ${phoneNumber}`);

      if (body.Body == '#clear#') {
        await this.fileService.salvarArquivoJson({});
        await this.sendMessage(
          body.From,
          body.To,
          'Base de dados reiniciada...',
        );

        return;
      } else if (body.Body == '#sair#') {
        await this.fileService.salvarArquivoJson({});
        await this.sendMessage(body.From, body.To, 'Contexto apagado...');

        return;
      }

      let payloadInputUser = null;
      if (body.NumMedia == Constant.TWILIO_TYPE_TEXT) {
        payloadInputUser = {
          type: Constant.BROKER_TYPE_TEXT,
          text: body.Body,
        };
      } else if (body.NumMedia == Constant.TWILIO_TYPE_FILE) {
        /**
         * Transcrever audio para texto utilizando o STT
         */
        const stt: any = '';

        payloadInputUser = {
          type: Constant.BROKER_TYPE_AUDIO,
          text: stt.text,
        };
      }

      /**
       * Consultar Assistant
       */
      await this.watsonService.createInstance();
      let watsonPayload = null;

      if (watsonContext) {
        watsonPayload = {
          user_id: userPhoneNumber,
          session_id: watsonContext.context.global.session_id,
          context: watsonContext.context,
        };
      } else {
        watsonPayload = {
          session_id: await this.watsonService.createSession(),
        };
      }

      const response = await this.watsonService.message(
        payloadInputUser.text,
        watsonPayload,
      );

      /**
       * Enviar a resposta do Assistant para a Twilio
       */
      if (response?.output?.generic) {
        await this.fileService.salvarArquivoJson({
          [userPhoneNumber]: response,
        });

        //TODO subistituir map poor for
        this.logger.log('message delivered');

        let mCounter = 0;
        for (const message of response.output.generic) {
          setTimeout(async () => {
            if (payloadInputUser.type == Constant.BROKER_TYPE_AUDIO) {
              await this.sendAudio(body.From, body.To, message.text);
            } else if (payloadInputUser.type == Constant.BROKER_TYPE_TEXT) {
              await this.sendMessage(body.From, body.To, message.text);
            }
          }, mCounter * 500);
          mCounter++;
        }
      }

      /**
       * Apagar arquivo de audio temporário
       */
    } catch (e) {
      this.logger.error(e);
    }
  }

  async sendAudio(to: string, from: string, message) {
    /**
     * Converter o texto para audio - TTS
     */

    this.client.messages
      .create({
        from,
        body: '',
        to,
      })
      .catch((err) => this.logger.error('error, message not sent', err));
  }

  async sendMessage(to: string, from: string, message: string) {
    this.client.messages
      .create({
        from,
        body: TextNormalizer(Constant.CHANNEL_TWILIO, message),
        // mediaUrl: "https://www.caceres.mt.gov.br/fotos_institucional_downloads/2.pdf",
        to,
      })
      .catch((err) => this.logger.error('error, message not sent', err));
  }
}
