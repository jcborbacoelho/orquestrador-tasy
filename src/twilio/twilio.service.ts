import { Injectable, Logger } from '@nestjs/common';
import { FileService } from 'src/file/file.service';
import { TextNormalizer } from 'src/helpers/common';
import { Constant } from 'src/helpers/constant';
import { WatsonService } from 'src/watson/watson.service';
import { Twilio } from 'twilio';
import * as fs from 'fs';
import * as tmp from 'tmp';
import axios from 'axios';
import { HttpService } from '@nestjs/axios';
import { ReadStream } from 'fs';
import { MediaInstance } from 'twilio/lib/rest/intelligence/v2/transcript/media';
import { Readable } from 'stream';
import { promisify } from 'util';
import * as path from 'path';
import async from 'async';
import { from } from 'ibm-watson/lib/recognize-stream';

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
      } else if (
        body.NumMedia == Constant.TWILIO_TYPE_FILE &&
        body.MediaContentType0 == 'audio/ogg'
      ) {
        const textOutput = await this.watsonService.STT(
          await this.getAudioBufferFromTwillioURL(body.MediaUrl0), //fs.createReadStream('teste.ogg'),
        );
        await this.sendAudio(
          'whatsapp:+5511985054202',
          'whatsapp:+18597805666',
          textOutput,
        ); //Germano Teste
        payloadInputUser = {
          type: Constant.BROKER_TYPE_AUDIO,
          text: textOutput,
        };
        return;
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
    /*const speakOutputStream: ReadableStream = await this.watsonService.TTS(
      textInput,
    );*/
    try {
      // Send the message with the media URL pointing to the temporary file
      const message = await this.client.messages.create({
        sendAsMms: true,
        from,
        mediaUrl: [
          'https://filesamples.com/samples/audio/opus/sample3.opus',
          //'https://opus-codec.org/static/examples/ehren-paper_lights-96.opus',//nao ok
          //'https://opus-codec.org/static/examples/samples/plc_orig.wav',//nao ok
          //'https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg',//nao ok
          //'https://file-examples.com/wp-content/storage/2017/11/file_example_MP3_700KB.mp3',//nao ok
          //'https://edisciplinas.usp.br/pluginfile.php/5196097/mod_resource/content/1/Teste.mp4', //ok
          //'https://file-examples.com/wp-content/storage/2017/11/file_example_WAV_1MG.wav', //nao ok
          //'https://upload.wikimedia.org/wikipedia/en/7/7d/Microphone_Test.ogg' //nao ok
          //'https://superdominios.org/wp-content/uploads/2019/06/dominio-online.jpg',//ok
        ], //[pathToFile],
        to,
      });

      console.log(message.sid);
    } finally {
    }
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
