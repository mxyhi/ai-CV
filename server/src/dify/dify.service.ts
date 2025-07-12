import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { SendMessageDto } from './dto/dify.dto';

@Injectable()
export class DifyService {
  private axiosInstance: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.axiosInstance = axios.create({
      timeout: 30000,
    });
  }

  private createDifyClient(apiKey: string, baseUrl: string) {
    return axios.create({
      baseURL: baseUrl,
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async sendMessage(
    sendMessageDto: SendMessageDto,
    botConfig: {
      difyApiKey: string;
      difyBaseUrl: string;
      difyAppId: string;
    },
  ) {
    const { message, userId, userName, conversationId, files } = sendMessageDto;
    const { difyApiKey, difyBaseUrl } = botConfig;

    const client = this.createDifyClient(difyApiKey, difyBaseUrl);

    try {
      const requestData: any = {
        inputs: {},
        query: message,
        response_mode: 'blocking',
        user: userId,
      };

      // 如果有对话ID，则继续对话
      if (conversationId) {
        requestData.conversation_id = conversationId;
      }

      // 如果有文件，添加文件信息
      if (files && files.length > 0) {
        requestData.files = files;
      }

      const response = await client.post('/chat-messages', requestData);

      return {
        messageId: response.data.message_id,
        conversationId: response.data.conversation_id,
        answer: response.data.answer,
        createdAt: response.data.created_at,
        metadata: response.data.metadata,
      };
    } catch (error) {
      console.error('Dify API Error:', error.response?.data || error.message);
      throw new HttpException(
        `Dify API调用失败: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAppInfo(apiKey: string, baseUrl: string) {
    const client = this.createDifyClient(apiKey, baseUrl);

    try {
      const response = await client.get('/info');
      return response.data;
    } catch (error) {
      console.error('Dify App Info Error:', error.response?.data || error.message);
      throw new HttpException(
        `获取Dify应用信息失败: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAppParameters(apiKey: string, baseUrl: string) {
    const client = this.createDifyClient(apiKey, baseUrl);

    try {
      const response = await client.get('/parameters');
      return response.data;
    } catch (error) {
      console.error('Dify App Parameters Error:', error.response?.data || error.message);
      throw new HttpException(
        `获取Dify应用参数失败: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    apiKey: string,
    baseUrl: string,
  ) {
    const client = this.createDifyClient(apiKey, baseUrl);

    try {
      const formData = new FormData();
      formData.append('file', new Blob([file.buffer]), file.originalname);
      formData.append('user', userId);

      const response = await client.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Dify File Upload Error:', error.response?.data || error.message);
      throw new HttpException(
        `文件上传失败: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getConversationMessages(
    conversationId: string,
    userId: string,
    apiKey: string,
    baseUrl: string,
    limit = 20,
    firstId?: string,
  ) {
    const client = this.createDifyClient(apiKey, baseUrl);

    try {
      const params: any = {
        user: userId,
        limit,
      };

      if (firstId) {
        params.first_id = firstId;
      }

      const response = await client.get(`/messages`, {
        params: {
          ...params,
          conversation_id: conversationId,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Dify Messages Error:', error.response?.data || error.message);
      throw new HttpException(
        `获取对话消息失败: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async validateDifyConfig(apiKey: string, baseUrl: string) {
    try {
      const appInfo = await this.getAppInfo(apiKey, baseUrl);
      return {
        valid: true,
        appInfo,
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }
}
