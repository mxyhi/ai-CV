import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import {
  StartChatDto,
  SendChatMessageDto,
  ChatConversationDto,
  ChatMessageDto,
} from './dto/chat.dto';

@ApiTags('聊天')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('start')
  @ApiOperation({ summary: '开始对话' })
  @ApiResponse({ status: 201, description: '对话创建成功', type: ChatConversationDto })
  @ApiResponse({ status: 404, description: '机器人不存在' })
  async startConversation(@Body() startChatDto: StartChatDto) {
    return this.chatService.startConversation(startChatDto);
  }

  @Post(':conversationId/messages')
  @ApiOperation({ summary: '发送消息' })
  @ApiResponse({ status: 201, description: '消息发送成功' })
  @ApiResponse({ status: 404, description: '对话不存在' })
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Body() sendMessageDto: SendChatMessageDto,
  ) {
    return this.chatService.sendMessage(conversationId, sendMessageDto);
  }

  @Get(':conversationId')
  @ApiOperation({ summary: '获取对话历史' })
  @ApiResponse({ status: 200, description: '获取成功', type: ChatConversationDto })
  @ApiResponse({ status: 404, description: '对话不存在' })
  @ApiQuery({ name: 'limit', required: false, description: '消息数量限制' })
  @ApiQuery({ name: 'offset', required: false, description: '偏移量' })
  async getConversationHistory(
    @Param('conversationId') conversationId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.chatService.getConversationHistory(
      conversationId,
      limit ? parseInt(limit.toString()) : 50,
      offset ? parseInt(offset.toString()) : 0,
    );
  }

  @Patch(':conversationId/close')
  @ApiOperation({ summary: '关闭对话' })
  @ApiResponse({ status: 200, description: '对话关闭成功' })
  @ApiResponse({ status: 404, description: '对话不存在' })
  async closeConversation(@Param('conversationId') conversationId: string) {
    return this.chatService.closeConversation(conversationId);
  }
}
