import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  Res,
  HttpException,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { Response } from "express";
import { DifyService } from "./dify.service";
import { PrismaService } from "../prisma/prisma.service";
import { ApiKeyGuard } from "../auth/guards/api-key.guard";
import {
  DifyConfig,
  DifyConfigType,
} from "../auth/decorators/dify-config.decorator";

@Controller("v1")
@UseGuards(ApiKeyGuard)
export class DifyProxyController {
  constructor(
    private readonly difyService: DifyService,
    private readonly prismaService: PrismaService
  ) {}

  // 更新使用统计的辅助方法
  private async updateApiKeyUsage(apiKeyRecord: any) {
    await this.prismaService.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: {
        lastUsedAt: new Date(),
        usageCount: { increment: 1 },
      },
    });
  }

  @Post("chat-messages")
  async chatMessages(
    @Body() body: any,
    @DifyConfig() config: DifyConfigType,
    @Res() res: Response
  ) {
    try {
      // 更新使用统计
      await this.updateApiKeyUsage(config.apiKeyRecord);

      // 转发请求到 Dify
      const result = await this.difyService.sendChatMessage(
        body,
        config.difyApiKey,
        config.difyBaseUrl,
        body.response_mode === "streaming" ? res : undefined
      );

      // 如果是流式模式，响应已经在 DifyService 中处理
      if (body.response_mode === "streaming") {
        return;
      }

      // 阻塞模式直接返回结果
      res.json(result);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("info")
  async getInfo(@DifyConfig() config: DifyConfigType) {
    try {
      return await this.difyService.getAppInfo(
        config.difyApiKey,
        config.difyBaseUrl
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("parameters")
  async getParameters(@DifyConfig() config: DifyConfigType) {
    try {
      return await this.difyService.getAppParameters(
        config.difyApiKey,
        config.difyBaseUrl
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("meta")
  async getMeta(@DifyConfig() config: DifyConfigType) {
    try {
      return await this.difyService.getAppMeta(
        config.difyApiKey,
        config.difyBaseUrl
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
