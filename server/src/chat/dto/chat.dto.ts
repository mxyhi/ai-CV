import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartChatDto {
  @ApiProperty({ description: '机器人ID' })
  @IsNotEmpty()
  @IsString()
  botId: string;

  @ApiProperty({ description: '用户ID' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: '用户名称', required: false })
  @IsOptional()
  @IsString()
  userName?: string;

  @ApiProperty({ description: '用户邮箱', required: false })
  @IsOptional()
  @IsString()
  userEmail?: string;
}

export class SendChatMessageDto {
  @ApiProperty({ description: '消息内容' })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({ description: '文件列表', required: false })
  @IsOptional()
  @IsArray()
  files?: any[];
}

export class ChatConversationDto {
  @ApiProperty({ description: '对话ID' })
  id: string;

  @ApiProperty({ description: '机器人信息' })
  bot: {
    id: string;
    name: string;
    avatar?: string;
    welcomeMessage?: string;
  };

  @ApiProperty({ description: '用户ID' })
  userId: string;

  @ApiProperty({ description: '用户名称' })
  userName?: string;

  @ApiProperty({ description: '对话状态' })
  status: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;
}

export class ChatMessageDto {
  @ApiProperty({ description: '消息ID' })
  id: string;

  @ApiProperty({ description: '消息内容' })
  content: string;

  @ApiProperty({ description: '消息角色' })
  role: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '元数据', required: false })
  metadata?: any;
}
