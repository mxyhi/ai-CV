import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBotDto, UpdateBotDto } from './dto/bot.dto';

@Injectable()
export class BotsService {
  constructor(private prisma: PrismaService) {}

  async create(createBotDto: CreateBotDto, userId: string) {
    // 检查Dify应用ID是否已存在
    const existingBot = await this.prisma.bot.findUnique({
      where: { difyAppId: createBotDto.difyAppId },
    });

    if (existingBot) {
      throw new ForbiddenException('该Dify应用ID已被使用');
    }

    return this.prisma.bot.create({
      data: {
        ...createBotDto,
        createdBy: userId,
        difyBaseUrl: createBotDto.difyBaseUrl || 'http://localhost/api',
        category: createBotDto.category || 'CUSTOMER_SERVICE',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(userId: string, userRole: string) {
    const where = userRole === 'ADMIN' ? {} : { createdBy: userId };

    return this.prisma.bot.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        _count: {
          select: {
            conversations: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string, userRole: string) {
    const bot = await this.prisma.bot.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        conversations: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            _count: {
              select: {
                messages: true,
              },
            },
          },
        },
        _count: {
          select: {
            conversations: true,
          },
        },
      },
    });

    if (!bot) {
      throw new NotFoundException('机器人不存在');
    }

    // 检查权限
    if (userRole !== 'ADMIN' && bot.createdBy !== userId) {
      throw new ForbiddenException('无权访问此机器人');
    }

    return bot;
  }

  async update(id: string, updateBotDto: UpdateBotDto, userId: string, userRole: string) {
    const bot = await this.prisma.bot.findUnique({
      where: { id },
    });

    if (!bot) {
      throw new NotFoundException('机器人不存在');
    }

    // 检查权限
    if (userRole !== 'ADMIN' && bot.createdBy !== userId) {
      throw new ForbiddenException('无权修改此机器人');
    }

    return this.prisma.bot.update({
      where: { id },
      data: updateBotDto,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    const bot = await this.prisma.bot.findUnique({
      where: { id },
    });

    if (!bot) {
      throw new NotFoundException('机器人不存在');
    }

    // 检查权限
    if (userRole !== 'ADMIN' && bot.createdBy !== userId) {
      throw new ForbiddenException('无权删除此机器人');
    }

    await this.prisma.bot.delete({
      where: { id },
    });

    return { message: '机器人删除成功' };
  }

  async findPublicBots() {
    return this.prisma.bot.findMany({
      where: {
        isPublic: true,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        avatar: true,
        category: true,
        welcomeMessage: true,
        createdAt: true,
        user: {
          select: {
            username: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getBotForChat(id: string) {
    const bot = await this.prisma.bot.findUnique({
      where: {
        id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        avatar: true,
        difyAppId: true,
        difyApiKey: true,
        difyBaseUrl: true,
        welcomeMessage: true,
        fallbackMessage: true,
        maxTokens: true,
        temperature: true,
      },
    });

    if (!bot) {
      throw new NotFoundException('机器人不存在或已被禁用');
    }

    return bot;
  }
}
