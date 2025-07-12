import { Module } from "@nestjs/common";
import { BotsService } from "./bots.service";
import { BotsController } from "./bots.controller";
import { BotSyncService } from "./bot-sync.service";
import { DifyModule } from "../dify/dify.module";

@Module({
  imports: [DifyModule],
  controllers: [BotsController],
  providers: [BotsService, BotSyncService],
  exports: [BotsService, BotSyncService],
})
export class BotsModule {}
