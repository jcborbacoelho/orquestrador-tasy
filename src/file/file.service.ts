import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class FileService {
  private path = './src/file/temp/database.json';

  // Função para ler o arquivo JSON
  async getAllJson(): Promise<any> {
    try {
      const data = fs.readFileSync(this.path, 'utf-8'); // Lê o arquivo
      const response: any = JSON.parse(data); // Converte o JSON em objeto

      return response;
    } catch (err) {
      console.error('Erro ao ler o arquivo JSON', err);
      return null;
    }
  }

  async getWatsonContextItemFromJsonByCallerId(callerId): Promise<any> {
    try {
      const response = await this.getAllJson();

      if (response[callerId]) {
        return response[callerId];
      }

      return null;
    } catch (err) {
      console.error('Erro ao ler o arquivo JSON', err);
      return null;
    }
  }

  async deletarItemJson(userPhoneNumber) {
    try {
      const allData = await this.getAllJson();

      if (allData[userPhoneNumber]) {
        delete allData[userPhoneNumber];

        fs.writeFileSync(this.path, JSON.stringify(allData, null, 2)); // Converte o objeto em JSON e salva
        console.log('Arquivo deletado com sucesso!');
      } else {
        console.log('Arquivo não encontrado!');
      }
    } catch (err) {
      console.error('Erro ao deletar item no arquivo JSON', err);
    }
  }

  async salvarArquivoJson(objectContext) {
    try {
      let allData = await this.getAllJson();
      const key = Object.keys(objectContext)[0];
      const value = Object.values(objectContext)[0];

      if (key && value) {
        allData[key] = value;
      } else {
        allData = {};
      }

      fs.writeFileSync(this.path, JSON.stringify(allData, null, 2)); // Converte o objeto em JSON e salva
      console.log('Arquivo salvo com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar o arquivo JSON', err);
    }
  }
}
