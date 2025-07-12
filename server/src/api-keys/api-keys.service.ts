import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateApiKeyDto, UpdateApiKeyDto } from "./dto/api-key.dto";
import * as crypto from "crypto";

@Injectable()
export class ApiKeysService {
  constructor(private prisma: PrismaService) {}

  /**
   * 生成API密钥
   */
  private generateApiKey(): { key: string; keyPrefix: string } {
    const randomBytes = crypto.randomBytes(32);
    const key = `ak_${randomBytes.toString("hex")}`;
    const keyPrefix = `${key.substring(0, 7)}...${key.substring(key.length - 4)}`;
    return { key, keyPrefix };
  }

  /**
   * 创建API密钥
   */
  async create(
    createApiKeyDto: CreateApiKeyDto,
    botId: string,
    userId: string,
    userRole: string
  ) {
    // 验证机器人是否存在且用户有权限
    const bot = await this.prisma.bot.findUnique({
      where: { id: botId },
    });

    if (!bot) {
      throw new NotFoundException("机器人不存在");
    }

    // 检查权限
    if (userRole !== "ADMIN" && bot.createdBy !== userId) {
      throw new ForbiddenException("无权为此机器人创建API密钥");
    }

    // 生成API密钥
    const { key, keyPrefix } = this.generateApiKey();

    // 创建API密钥记录
    const apiKey = await this.prisma.apiKey.create({
      data: {
        name: createApiKeyDto.name,
        key,
        keyPrefix,
        botId,
        permissions: createApiKeyDto.permissions || "chat",
        rateLimit: createApiKeyDto.rateLimit || 100,
        expiresAt: createApiKeyDto.expiresAt
          ? new Date(createApiKeyDto.expiresAt)
          : null,
      },
      include: {
        bot: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    // 返回包含完整密钥的响应（仅在创建时返回）
    return {
      ...apiKey,
      key, // 完整密钥仅在创建时返回
    };
  }

  /**
   * 获取机器人的API密钥列表
   */
  async findByBot(botId: string, userId: string, userRole: string) {
    // 验证机器人是否存在且用户有权限
    const bot = await this.prisma.bot.findUnique({
      where: { id: botId },
    });

    if (!bot) {
      throw new NotFoundException("机器人不存在");
    }

    // 检查权限
    if (userRole !== "ADMIN" && bot.createdBy !== userId) {
      throw new ForbiddenException("无权查看此机器人的API密钥");
    }

    const apiKeys = await this.prisma.apiKey.findMany({
      where: { botId },
      include: {
        bot: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 不返回完整的密钥，只返回前缀
    return apiKeys.map(({ key, ...apiKey }) => apiKey);
  }

  /**
   * 获取单个API密钥详情
   */
  async findOne(id: string, userId: string, userRole: string) {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { id },
      include: {
        bot: {
          select: {
            id: true,
            name: true,
            description: true,
            createdBy: true,
          },
        },
      },
    });

    if (!apiKey) {
      throw new NotFoundException("API密钥不存在");
    }

    // 检查权限
    if (userRole !== "ADMIN" && apiKey.bot.createdBy !== userId) {
      throw new ForbiddenException("无权查看此API密钥");
    }

    // 不返回完整的密钥
    const { key, ...result } = apiKey;
    return result;
  }

  /**
   * 更新API密钥
   */
  async update(
    id: string,
    updateApiKeyDto: UpdateApiKeyDto,
    userId: string,
    userRole: string
  ) {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { id },
      include: {
        bot: {
          select: {
            createdBy: true,
          },
        },
      },
    });

    if (!apiKey) {
      throw new NotFoundException("API密钥不存在");
    }

    // 检查权限
    if (userRole !== "ADMIN" && apiKey.bot.createdBy !== userId) {
      throw new ForbiddenException("无权修改此API密钥");
    }

    const updatedApiKey = await this.prisma.apiKey.update({
      where: { id },
      data: {
        ...updateApiKeyDto,
        expiresAt: updateApiKeyDto.expiresAt
          ? new Date(updateApiKeyDto.expiresAt)
          : undefined,
      },
      include: {
        bot: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    // 不返回完整的密钥
    const { key, ...result } = updatedApiKey;
    return result;
  }

  /**
   * 删除API密钥
   */
  async remove(id: string, userId: string, userRole: string) {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { id },
      include: {
        bot: {
          select: {
            createdBy: true,
          },
        },
      },
    });

    if (!apiKey) {
      throw new NotFoundException("API密钥不存在");
    }

    // 检查权限
    if (userRole !== "ADMIN" && apiKey.bot.createdBy !== userId) {
      throw new ForbiddenException("无权删除此API密钥");
    }

    await this.prisma.apiKey.delete({
      where: { id },
    });

    return { message: "API密钥删除成功" };
  }

  /**
   * 验证API密钥并返回关联的机器人信息
   */
  async validateApiKey(key: string) {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { key },
      include: {
        bot: {
          select: {
            id: true,
            name: true,
            isActive: true,
            difyApiKey: true,
            difyBaseUrl: true,
            welcomeMessage: true,
          },
        },
      },
    });

    if (!apiKey) {
      throw new UnauthorizedException("无效的API密钥");
    }

    if (!apiKey.isActive) {
      throw new UnauthorizedException("API密钥已被禁用");
    }

    if (!apiKey.bot.isActive) {
      throw new UnauthorizedException("关联的机器人已被禁用");
    }

    // 检查是否过期
    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      throw new UnauthorizedException("API密钥已过期");
    }

    // 更新使用统计
    await this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: {
        lastUsedAt: new Date(),
        usageCount: {
          increment: 1,
        },
      },
    });

    return {
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        permissions: apiKey.permissions,
        rateLimit: apiKey.rateLimit,
      },
      bot: apiKey.bot,
    };
  }

  /**
   * 重新生成API密钥
   */
  async regenerate(id: string, userId: string, userRole: string) {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { id },
      include: {
        bot: {
          select: {
            id: true,
            name: true,
            description: true,
            createdBy: true,
          },
        },
      },
    });

    if (!apiKey) {
      throw new NotFoundException("API密钥不存在");
    }

    // 检查权限
    if (userRole !== "ADMIN" && apiKey.bot.createdBy !== userId) {
      throw new ForbiddenException("无权重新生成此API密钥");
    }

    // 生成新的API密钥
    const { key, keyPrefix } = this.generateApiKey();

    const updatedApiKey = await this.prisma.apiKey.update({
      where: { id },
      data: {
        key,
        keyPrefix,
        usageCount: 0, // 重置使用次数
        lastUsedAt: null, // 重置最后使用时间
      },
      include: {
        bot: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    // 返回包含新密钥的响应
    return {
      ...updatedApiKey,
      key, // 完整密钥仅在重新生成时返回
    };
  }
}
