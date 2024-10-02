import { Injectable } from '@nestjs/common';
import * as IBM from 'ibm-cos-sdk';

@Injectable()
export class S3Service {
  private config;

  constructor() {
    this.config = {
      endpoint: process.env.IBM_ENDPOINT, // Endereço do seu COS
      apiKeyId: process.env.IBM_APIKEY, // Sua API Key do IBM Cloud
      serviceInstanceId: process.env.IBM_INSTANCE_ID, // ID da instância do seu COS
    };
  }

  async uploadFile(buffer, filename: string) {
    const cos = new IBM.S3(this.config);
    const params = {
      Bucket: 'tasy-audio', // Nome do bucket
      Key: `${filename}.ogg`, // Nome do arquivo
      Body: buffer,
      ContentType: 'audio/ogg; codecs=opus', // Tipo de conteúdo
      ACL: 'public-read', // Deixe o arquivo público para acesso
    };

    try {
      const data = await cos.upload(params).promise();

            return data.Location // URL pública do arquivo
        } catch (err) {
            console.error('Erro ao fazer upload no IBM Cloud Object Storage:', err);
            throw err;
        }
    }
}
