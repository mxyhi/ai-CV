import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBotDto, UpdateBotDto } from "./dto/bot.dto";
import { BotSyncService } from "./bot-sync.service";

@Injectable()
export class BotsService {
  constructor(
    private prisma: PrismaService,
    private botSyncService: BotSyncService
  ) {}

  async create(createBotDto: CreateBotDto, userId: string) {
    // 创建机器人
    const bot = await this.prisma.bot.create({
      data: {
        ...createBotDto,
        createdBy: userId,
        difyBaseUrl: createBotDto.difyBaseUrl || "http://localhost/api",
        category: createBotDto.category || "CUSTOMER_SERVICE",
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

    return bot;
  }

  async findAll(
    userId: string,
    userRole: string,
    options?: {
      page?: number;
      limit?: number;
      search?: string;
    }
  ) {
    const { page = 1, limit = 20, search } = options || {};
    const skip = (page - 1) * limit;

    let where: any = userRole === "ADMIN" ? {} : { createdBy: userId };

    // 添加搜索条件
    if (search) {
      where = {
        ...where,
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const [bots, total] = await Promise.all([
      this.prisma.bot.findMany({
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
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      this.prisma.bot.count({ where }),
    ]);

    return {
      data: bots,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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
            createdAt: "desc",
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
      throw new NotFoundException("机器人不存在");
    }

    // 检查权限
    if (userRole !== "ADMIN" && bot.createdBy !== userId) {
      throw new ForbiddenException("无权访问此机器人");
    }

    return bot;
  }

  async update(
    id: string,
    updateBotDto: UpdateBotDto,
    userId: string,
    userRole: string
  ) {
    const bot = await this.prisma.bot.findUnique({
      where: { id },
    });

    if (!bot) {
      throw new NotFoundException("机器人不存在");
    }

    // 检查权限
    if (userRole !== "ADMIN" && bot.createdBy !== userId) {
      throw new ForbiddenException("无权修改此机器人");
    }

    // 从更新数据中移除 welcomeMessage，因为它应该从 Dify API 同步获取
    const { welcomeMessage, ...updateData } = updateBotDto;

    // 如果用户尝试更新 welcomeMessage，记录警告
    if (welcomeMessage !== undefined) {
      console.warn(
        `用户尝试更新机器人 ${id} 的 welcomeMessage，此字段将被忽略。请使用同步接口从 Dify 获取最新信息。`
      );
    }

    return this.prisma.bot.update({
      where: { id },
      data: updateData,
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
      throw new NotFoundException("机器人不存在");
    }

    // 检查权限
    if (userRole !== "ADMIN" && bot.createdBy !== userId) {
      throw new ForbiddenException("无权删除此机器人");
    }

    await this.prisma.bot.delete({
      where: { id },
    });

    return { message: "机器人删除成功" };
  }

  async findPublicBots() {
    // 注意：isPublic 字段已移除，现在返回所有活跃的机器人
    // 如果需要公开/私有功能，建议在 Dify 应用层面配置
    return this.prisma.bot.findMany({
      where: {
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
        createdAt: "desc",
      },
    });
  }

  async getBotForChat(id: string) {
    // 使用同步服务获取最新的机器人信息
    const bot = await this.botSyncService.getBotWithSync(id);

    if (!bot || !bot.isActive) {
      throw new NotFoundException("机器人不存在或已被禁用");
    }

    // 返回聊天所需的字段
    return {
      id: bot.id,
      name: bot.name,
      description: bot.description,
      avatar: bot.avatar,
      difyApiKey: bot.difyApiKey,
      difyBaseUrl: bot.difyBaseUrl,
      welcomeMessage: bot.welcomeMessage,
    };
  }
}
