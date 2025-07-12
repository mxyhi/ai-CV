import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BotSyncService } from './bot-sync.service';

@Injectable()
export class BotSyncTask {
  private readonly logger = new Logger(BotSyncTask.name);

  constructor(private botSyncService: BotSyncService) {}

  /**
   * 每小时同步一次所有活跃机器人的信息
   */
  @Cron(CronExpression.EVERY_HOUR)
  async syncAllBotsHourly() {
    this.logger.log('开始定时同步所有活跃机器人信息...');
    
    try {
      const result = await this.botSyncService.syncAllActiveBots();
      this.logger.log(
        `定时同步完成: 总计 ${result.total} 个机器人，成功 ${result.successful} 个，失败 ${result.failed} 个`
      );
    } catch (error) {
      this.logger.error('定时同步失败:', error);
    }
  }

  /**
   * 每天凌晨2点进行一次完整同步
   */
  @Cron('0 2 * * *')
  async syncAllBotsDaily() {
    this.logger.log('开始每日完整同步所有活跃机器人信息...');
    
    try {
      const result = await this.botSyncService.syncAllActiveBots();
      this.logger.log(
        `每日同步完成: 总计 ${result.total} 个机器人，成功 ${result.successful} 个，失败 ${result.failed} 个`
      );
    } catch (error) {
      this.logger.error('每日同步失败:', error);
    }
  }
}
