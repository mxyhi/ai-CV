import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { DifyModule } from '../dify/dify.module';
import { BotsModule } from '../bots/bots.module';

@Module({
  imports: [DifyModule, BotsModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
