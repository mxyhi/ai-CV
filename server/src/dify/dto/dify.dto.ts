import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ description: '消息内容' })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({ description: '用户ID' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: '用户名称', required: false })
  @IsOptional()
  @IsString()
  userName?: string | null;

  @ApiProperty({ description: '对话ID', required: false })
  @IsOptional()
  @IsString()
  conversationId?: string | null;

  @ApiProperty({ description: '文件列表', required: false })
  @IsOptional()
  @IsArray()
  files?: any[];
}

export class ChatResponseDto {
  @ApiProperty({ description: '消息ID' })
  messageId: string;

  @ApiProperty({ description: '对话ID' })
  conversationId: string;

  @ApiProperty({ description: '回复内容' })
  answer: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: number;

  @ApiProperty({ description: '元数据', required: false })
  metadata?: any;
}

export class DifyAppInfoDto {
  @ApiProperty({ description: '应用名称' })
  name: string;

  @ApiProperty({ description: '应用描述' })
  description: string;

  @ApiProperty({ description: '应用标签' })
  tags: string[];

  @ApiProperty({ description: '应用模式' })
  mode: string;

  @ApiProperty({ description: '作者名称' })
  author_name: string;
}
