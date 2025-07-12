import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DifyService } from '../dify/dify.service';

@Injectable()
export class BotSyncService {
  private readonly logger = new Logger(BotSyncService.name);

  constructor(
    private prisma: PrismaService,
    private difyService: DifyService,
  ) {}

  /**
   * 从 Dify API 同步机器人信息到本地缓存
   * @param botId 机器人ID
   * @returns 更新后的机器人信息
   */
  async syncBotFromDify(botId: string) {
    try {
      // 获取机器人配置
      const bot = await this.prisma.bot.findUnique({
        where: { id: botId },
      });

      if (!bot) {
        throw new Error(`Bot with id ${botId} not found`);
      }

      // 从 Dify API 获取应用信息
      const [appInfo, appParameters, appSite] = await Promise.allSettled([
        this.difyService.getAppInfo(bot.difyApiKey, bot.difyBaseUrl),
        this.difyService.getAppParameters(bot.difyApiKey, bot.difyBaseUrl),
        this.difyService.getAppMeta(bot.difyApiKey, bot.difyBaseUrl),
      ]);

      // 准备更新数据
      const updateData: any = {};

      // 从 /info 端点获取基本信息
      if (appInfo.status === 'fulfilled') {
        const info = appInfo.value;
        if (info.name) updateData.name = info.name;
        if (info.description) updateData.description = info.description;
      } else {
        this.logger.warn(`Failed to get app info for bot ${botId}:`, appInfo.reason);
      }

      // 从 /parameters 端点获取欢迎消息
      if (appParameters.status === 'fulfilled') {
        const params = appParameters.value;
        if (params.opening_statement) {
          updateData.welcomeMessage = params.opening_statement;
        }
      } else {
        this.logger.warn(`Failed to get app parameters for bot ${botId}:`, appParameters.reason);
      }

      // 从 /site 端点获取头像信息
      if (appSite.status === 'fulfilled') {
        const site = appSite.value;
        if (site.icon) {
          // 如果是 emoji 类型，直接使用 emoji
          // 如果是 image 类型，使用 icon_url 或 icon
          updateData.avatar = site.icon;
        }
      } else {
        this.logger.warn(`Failed to get app site info for bot ${botId}:`, appSite.reason);
      }

      // 更新数据库
      if (Object.keys(updateData).length > 0) {
        const updatedBot = await this.prisma.bot.update({
          where: { id: botId },
          data: updateData,
        });

        this.logger.log(`Successfully synced bot ${botId} from Dify API`);
        return updatedBot;
      } else {
        this.logger.warn(`No data to update for bot ${botId}`);
        return bot;
      }
    } catch (error) {
      this.logger.error(`Failed to sync bot ${botId} from Dify API:`, error);
      throw error;
    }
  }

  /**
   * 获取机器人信息，优先从缓存获取，如果缓存过期则从 Dify API 同步
   * @param botId 机器人ID
   * @param forceSync 是否强制同步
   * @returns 机器人信息
   */
  async getBotWithSync(botId: string, forceSync = false) {
    const bot = await this.prisma.bot.findUnique({
      where: { id: botId },
    });

    if (!bot) {
      throw new Error(`Bot with id ${botId} not found`);
    }

    // 检查是否需要同步（缓存超过1小时或强制同步）
    const shouldSync = forceSync || 
      !bot.updatedAt || 
      Date.now() - bot.updatedAt.getTime() > 60 * 60 * 1000; // 1小时

    if (shouldSync) {
      try {
        return await this.syncBotFromDify(botId);
      } catch (error) {
        this.logger.warn(`Failed to sync bot ${botId}, using cached data:`, error);
        return bot;
      }
    }

    return bot;
  }

  /**
   * 批量同步所有活跃机器人
   */
  async syncAllActiveBots() {
    try {
      const activeBots = await this.prisma.bot.findMany({
        where: { isActive: true },
        select: { id: true },
      });

      this.logger.log(`Starting sync for ${activeBots.length} active bots`);

      const results = await Promise.allSettled(
        activeBots.map(bot => this.syncBotFromDify(bot.id))
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      this.logger.log(`Sync completed: ${successful} successful, ${failed} failed`);

      return {
        total: activeBots.length,
        successful,
        failed,
      };
    } catch (error) {
      this.logger.error('Failed to sync all active bots:', error);
      throw error;
    }
  }

  /**
   * 验证 Dify API 连接
   * @param difyApiKey Dify API 密钥
   * @param difyBaseUrl Dify API 基础URL
   * @returns 验证结果
   */
  async validateDifyConnection(difyApiKey: string, difyBaseUrl: string) {
    try {
      const appInfo = await this.difyService.getAppInfo(difyApiKey, difyBaseUrl);
      return {
        valid: true,
        appInfo,
      };
    } catch (error) {
      this.logger.warn('Dify connection validation failed:', error);
      return {
        valid: false,
        error: error.message,
      };
    }
  }
}
