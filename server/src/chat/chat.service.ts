import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DifyService } from '../dify/dify.service';
import { BotsService } from '../bots/bots.service';
import { StartChatDto, SendChatMessageDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private difyService: DifyService,
    private botsService: BotsService,
  ) {}

  async startConversation(startChatDto: StartChatDto) {
    const { botId, userId, userName, userEmail } = startChatDto;

    // 获取机器人信息
    const bot = await this.botsService.getBotForChat(botId);

    // 检查是否已有活跃对话
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        botId,
        userId,
        status: 'ACTIVE',
      },
      include: {
        bot: {
          select: {
            id: true,
            name: true,
            avatar: true,
            welcomeMessage: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    // 如果没有活跃对话，创建新对话
    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          botId,
          userId,
          userName,
          userEmail,
          status: 'ACTIVE',
        },
        include: {
          bot: {
            select: {
              id: true,
              name: true,
              avatar: true,
              welcomeMessage: true,
            },
          },
          messages: true,
        },
      });

      // 如果有欢迎消息，添加欢迎消息
      if (bot.welcomeMessage) {
        await this.prisma.message.create({
          data: {
            conversationId: conversation.id,
            content: bot.welcomeMessage,
            role: 'ASSISTANT',
          },
        });
      }
    }

    return {
      conversationId: conversation.id,
      bot: conversation.bot,
      messages: conversation.messages,
    };
  }

  async sendMessage(conversationId: string, sendMessageDto: SendChatMessageDto) {
    const { message, files } = sendMessageDto;

    // 获取对话信息
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        bot: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException('对话不存在');
    }

    if (conversation.status !== 'ACTIVE') {
      throw new NotFoundException('对话已关闭');
    }

    // 保存用户消息
    const userMessage = await this.prisma.message.create({
      data: {
        conversationId,
        content: message,
        role: 'USER',
        metadata: files ? JSON.stringify({ files }) : null,
      },
    });

    try {
      // 调用Dify API
      const difyResponse = await this.difyService.sendMessage(
        {
          message,
          userId: conversation.userId,
          userName: conversation.userName,
          conversationId: conversation.difyConversationId,
          files,
        },
        {
          difyApiKey: conversation.bot.difyApiKey,
          difyBaseUrl: conversation.bot.difyBaseUrl,
          difyAppId: conversation.bot.difyAppId,
        },
      );

      // 更新对话的Dify对话ID
      if (!conversation.difyConversationId && difyResponse.conversationId) {
        await this.prisma.conversation.update({
          where: { id: conversationId },
          data: {
            difyConversationId: difyResponse.conversationId,
          },
        });
      }

      // 保存机器人回复
      const botMessage = await this.prisma.message.create({
        data: {
          conversationId,
          content: difyResponse.answer,
          role: 'ASSISTANT',
          difyMessageId: difyResponse.messageId,
          metadata: difyResponse.metadata ? JSON.stringify(difyResponse.metadata) : null,
        },
      });

      return {
        userMessage: {
          id: userMessage.id,
          content: userMessage.content,
          role: userMessage.role,
          createdAt: userMessage.createdAt,
        },
        botMessage: {
          id: botMessage.id,
          content: botMessage.content,
          role: botMessage.role,
          createdAt: botMessage.createdAt,
        },
      };
    } catch (error) {
      // 如果Dify调用失败，返回兜底消息
      const fallbackMessage = conversation.bot.fallbackMessage || '抱歉，我现在无法回答您的问题，请稍后再试。';
      
      const botMessage = await this.prisma.message.create({
        data: {
          conversationId,
          content: fallbackMessage,
          role: 'ASSISTANT',
        },
      });

      return {
        userMessage: {
          id: userMessage.id,
          content: userMessage.content,
          role: userMessage.role,
          createdAt: userMessage.createdAt,
        },
        botMessage: {
          id: botMessage.id,
          content: botMessage.content,
          role: botMessage.role,
          createdAt: botMessage.createdAt,
        },
        error: error.message,
      };
    }
  }

  async getConversationHistory(conversationId: string, limit = 50, offset = 0) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        bot: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
          skip: offset,
          take: limit,
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('对话不存在');
    }

    return conversation;
  }

  async closeConversation(conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('对话不存在');
    }

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        status: 'CLOSED',
      },
    });

    return { message: '对话已关闭' };
  }
}
