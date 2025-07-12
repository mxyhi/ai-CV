import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import {
  StartChatDto,
  SendChatMessageDto,
  ChatConversationDto,
  ChatMessageDto,
} from './dto/chat.dto';
import { ApiKeyAuthGuard } from '../auth/guards/api-key-auth.guard';
import { ApiKey, BotFromApiKey } from '../auth/decorators/api-key.decorator';

@ApiTags('聊天')
@Controller('chat')
@UseGuards(ApiKeyAuthGuard)
@ApiSecurity('api-key')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('start')
  @ApiOperation({ summary: '开始对话' })
  @ApiResponse({
    status: 201,
    description: '对话创建成功',
    type: ChatConversationDto,
  })
  @ApiResponse({ status: 404, description: '机器人不存在' })
  @ApiResponse({ status: 401, description: '无效的API密钥' })
  async startConversation(
    @Body() startChatDto: StartChatDto,
    @BotFromApiKey() bot: any,
    @ApiKey() apiKey: any,
  ) {
    return this.chatService.startConversationWithApiKey(
      startChatDto,
      bot,
      apiKey,
    );
  }

  @Post(':conversationId/messages')
  @ApiOperation({ summary: '发送消息' })
  @ApiResponse({ status: 201, description: '消息发送成功' })
  @ApiResponse({ status: 404, description: '对话不存在' })
  @ApiResponse({ status: 401, description: '无效的API密钥' })
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Body() sendMessageDto: SendChatMessageDto,
    @BotFromApiKey() bot: any,
    @ApiKey() apiKey: any,
  ) {
    return this.chatService.sendMessageWithApiKey(
      conversationId,
      sendMessageDto,
      bot,
      apiKey,
    );
  }

  @Get(':conversationId')
  @ApiOperation({ summary: '获取对话历史' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: ChatConversationDto,
  })
  @ApiResponse({ status: 404, description: '对话不存在' })
  @ApiResponse({ status: 401, description: '无效的API密钥' })
  @ApiQuery({ name: 'limit', required: false, description: '消息数量限制' })
  @ApiQuery({ name: 'offset', required: false, description: '偏移量' })
  async getConversationHistory(
    @Param('conversationId') conversationId: string,
    @BotFromApiKey() bot: any,
    @ApiKey() apiKey: any,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.chatService.getConversationHistoryWithApiKey(
      conversationId,
      limit ? parseInt(limit.toString()) : 50,
      offset ? parseInt(offset.toString()) : 0,
      bot,
      apiKey,
    );
  }

  @Patch(':conversationId/close')
  @ApiOperation({ summary: '关闭对话' })
  @ApiResponse({ status: 200, description: '对话关闭成功' })
  @ApiResponse({ status: 404, description: '对话不存在' })
  @ApiResponse({ status: 401, description: '无效的API密钥' })
  async closeConversation(
    @Param('conversationId') conversationId: string,
    @BotFromApiKey() bot: any,
    @ApiKey() apiKey: any,
  ) {
    return this.chatService.closeConversationWithApiKey(
      conversationId,
      bot,
      apiKey,
    );
  }
}
