import { Injectable, Logger } from '@nestjs/common';
import { FileService } from 'src/file/file.service';
import { TextNormalizer } from 'src/helpers/common';
import { Constant } from 'src/helpers/constant';
import { WatsonService } from 'src/watson/watson.service';
import { Twilio } from 'twilio';
import axios from 'axios';
import { S3Service } from 'src/watson/s3/s3.service';
import { TwilioRequestDTO } from './dto/twilio-request.dto';
const { v4: uuidv4 } = require('uuid');

@Injectable()
export class TwilioService {
  private client: Twilio;
  private logger = new Logger('BrokerTwilioService');

  constructor(
    private readonly watsonService: WatsonService,
    private readonly fileService: FileService,
    private readonly s3Service: S3Service,
  ) {}

  async run(body: TwilioRequestDTO): Promise<any> {
    // await this.sendAudio(body.From, body.To, "Apenas testando", body.MessageSid);
    // return;
    try {
      this.logger.log('broker started');

      //colocar um try catch?
      const phoneNumber = body.To.replace(/\D/g, '');
      const userPhoneNumber = body.From.replace(/\D/g, '');
      const watsonContext =
        await this.fileService.getWatsonContextItemFromJsonByCallerId(
          userPhoneNumber,
        );

      this.client = new Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
      this.logger.log('credentials found:', `phone-number: ${phoneNumber}`);
      ////LIMPA CONTEXTOS
      if (body.Body == '#clear#') {
        await this.fileService.salvarArquivoJson({});
        await this.sendMessage(
          body.From,
          body.To,
          'Base de dados reiniciada...',
        );

        return;
        ////LIMPA CONTEXTO DO SOLICITANTE
      } else if (body.Body == '#sair#') {
        await this.fileService.salvarArquivoJson({});
        await this.sendMessage(body.From, body.To, 'Contexto apagado...');

        return;
      }
      ////VERIFICA ENTRADA DE TEXTO OU AUDIO OGG
      let payloadInputUser: { type: string; text: string } = null;
      if (body.NumMedia == Constant.TWILIO_TYPE_TEXT) {
        payloadInputUser = {
          type: Constant.BROKER_TYPE_TEXT,
          text: body.Body,
        };
      } else if (
        body.NumMedia == Constant.TWILIO_TYPE_FILE &&
        body.MediaContentType0 == 'audio/ogg'
      ) {
        const textOutput: string = await this.watsonService.STT(
          await this.getAudioBufferFromTwillioURL(body.MediaUrl0),
        );

        payloadInputUser = {
          type: Constant.BROKER_TYPE_AUDIO,
          text: textOutput?.trim(),
        };
      }

      /**
       * Consultar Assistant
       */
      const watsonResponse: any =
        await this.watsonService.sendAssistantMessageWithContext(
          watsonContext,
          userPhoneNumber,
          payloadInputUser.text,
        );

      /**
       * Enviar a resposta do Assistant para a Twilio
       */
      if ( watsonResponse?.output?.generic && watsonResponse?.output?.generic.length ) {
        //SALVA CONTEXTO
        await this.fileService.salvarArquivoJson({
          [userPhoneNumber]: watsonResponse,
        });

        //TODO subistituir map poor for
        this.logger.log('message delivered');

        let mCounter = 0;
        for (const message of watsonResponse.output.generic) {
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

  async getAudioBufferFromTwillioURL(audioUrl: string): Promise<Buffer> {
    try {
      // Download the audio file
      const response = await axios.get(audioUrl, {
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(
              `${process.env.TWILIO_SID}:${process.env.TWILIO_AUTH}`,
            ).toString('base64'),
        },
        responseType: 'arraybuffer', // Get the response as an ArrayBuffer
      });
      // Create a Buffer from the response data
      const audioBuffer = Buffer.from(response.data);
      return audioBuffer;
    } catch (error) {
      console.error('Error downloading audio:', error);
      throw error;
    }
  }
  async streamToFile(readableStream, fileName) {
    // Create a response from the ReadableStream
    const response = new Response(readableStream);

    // Convert the response to a Blob
    const blob = await response.blob();

    // Create a file from the Blob
    const file = new File([blob], fileName, { type: blob.type });

    return file;
  }

    //Germano TODO: Função problemática //2 problemas: aceite do arquivo e tranformacao do arquivo
    async sendAudio(to: string, from: string, textInput: string) {
        const speakOutputStream: ReadableStream = await this.watsonService.TTS(
          textInput,
        );
        const filename = uuidv4()

        const urlSpeakOutputStream = await this.s3Service.uploadFile(speakOutputStream, filename.toString())

        try {
            const url = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_SID}/Messages.json`;

      const data = new URLSearchParams();
      data.append('From', from);
      data.append('To', to);
      data.append('MediaUrl', urlSpeakOutputStream);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization:
            'Basic ' +
            btoa(`${process.env.TWILIO_SID}:${process.env.TWILIO_AUTH}`),
          'Content-Type': 'audio/ogg; codecs=opus',
        },
        body: data,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error sending message: ${response.status} ${errorText}`,
        );
      }

      const responseData = await response.json();
      console.log('Message sent successfully:', responseData);
    } catch (err) {
      console.error(err);
    }
  }


    async sendMessage(to: string, from: string, message: string) {
        this.client.messages
            .create({
                from,
                body: TextNormalizer(Constant.CHANNEL_TWILIO, message),
                to,
            })
            .catch((err) => this.logger.error('error, message not sent', err));
    }

    async getSetor(input: string) {
        const match = input.match(/setor\s([a-zA-Z])/i);

        if(match) {
            const nomeSetor = match[1].toUpperCase();

            return await this.getCodeSetor(nomeSetor)
        }

        return {}
    }

    async getCodeSetor(dsSetor: string) {
        switch(dsSetor.toUpperCase()) {
            case 'A':
                return {setorA: true}
            break;
            case 'B':
                return {setorB: true}
            break;
            case 'C':
                return {setorC: true}
            break;
            case 'ONCOLOGIA':
                return {setorOncologia: true}
            break;
        }
    }
}
