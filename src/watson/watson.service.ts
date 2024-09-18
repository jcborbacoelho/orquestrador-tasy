import { Injectable } from '@nestjs/common';
import * as AssistantV2 from 'ibm-watson/assistant/v2';
import { IamAuthenticator } from 'ibm-watson/auth';
import { Constant } from 'src/helpers/constant';
import { WatsonConfigDto } from './dto/watsonAssistant.dto';
import * as SpeechToTextV1 from 'ibm-watson/speech-to-text/v1';
import * as TextToSpeechV1 from 'ibm-watson/text-to-speech/v1';

import {
  RecognizeParams,
  SpeechRecognitionResults,
} from 'ibm-watson/speech-to-text/v1-generated';
import { ReadStream } from 'fs';
import { Stream } from 'stream';

@Injectable()
export class WatsonService {
  private assistantV2;

  constructor() {}

  async createInstance() {
    this.assistantV2 = await new AssistantV2({
      version: Constant.WATSON_VERSION,
      authenticator: new IamAuthenticator({
        apikey: process.env.WATSON_API_KEY,
      }),
      serviceUrl: process.env.WATSON_URL,
    });
  }

  async createSession(): Promise<string> {
    return await this.assistantV2
      .createSession({
        assistantId: process.env.WATSON_ENVIRONMENT_ID,
      })
      .then((res) => {
        return res.result.session_id;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async message(
    brokerInput: string,
    watsonConfig: WatsonConfigDto,
  ): Promise<any> {
    try {
      const payload = {
        assistantId: process.env.WATSON_ENVIRONMENT_ID,
        sessionId: watsonConfig.session_id,
        input: {
          message_type: 'text',
          text: brokerInput,
          options: { return_context: true },
        },
        context: watsonConfig?.context ?? {},
      };

      if (watsonConfig.context?.global?.system?.user_id) {
        payload['userId'] = watsonConfig.context.global.system.user_id;
      }

      const watsonResponse = await this.assistantV2.message(payload);

      return watsonResponse.result;
    } catch (error) {
      console.log(error);
    }
  }
  async STT(InputSpeak: Buffer): Promise<string> {
    /**
     * Transcrever audio para texto utilizando o STT
     */
    const speechToText: SpeechToTextV1 = new SpeechToTextV1({
      authenticator: new IamAuthenticator({
        apikey: process.env.WATSON_API_KEY_STT,
      }),
      serviceUrl: process.env.WATSON_URL_STT,
      disableSslVerification: true,
    });

    const recognizeParams: RecognizeParams = {
      audio: InputSpeak, //fs.createReadStream('teste.ogg'),
      contentType: 'audio/ogg',
      model: 'pt-BR',
    };

    let textOutput: any = null;
    await speechToText
      .recognize(recognizeParams)
      .then((speechRecognitionResults) => {
        console.log(
          speechRecognitionResults.result.results[0].alternatives[0].transcript,
        );
        textOutput =
          speechRecognitionResults.result.results[0].alternatives[0].transcript;
        console.log(JSON.stringify(speechRecognitionResults, null, 2));
      })
      .catch((err) => {
        console.log('error:', err);
      });
    return textOutput;
  }

  async TTS(textInput: string): Promise<ReadableStream> {
    //TTS teste germano
    const textToSpeech = new TextToSpeechV1({
      authenticator: new IamAuthenticator({
        apikey: process.env.WATSON_API_KEY_TTS,
      }),
      serviceUrl: process.env.WATSON_URL_TTS,
    });

    const synthesizeParams = {
      text: textInput,
      accept: 'audio/ogg;codecs=opus',
      voice: 'pt-BR_IsabelaV3Voice',
    };

    try {
      const response: any = await textToSpeech.synthesize(synthesizeParams);
      const audioStream: any = response.result;
      return audioStream;
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      throw error; // Rethrow the error for further handling
    }
  }
}
