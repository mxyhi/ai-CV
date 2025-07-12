import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBotDto {
  @ApiProperty({ description: '机器人名称' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: '机器人描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '机器人头像URL', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: 'Dify应用ID', required: false })
  @IsOptional()
  @IsString()
  difyAppId?: string;

  @ApiProperty({ description: 'Dify API密钥' })
  @IsNotEmpty()
  @IsString()
  difyApiKey: string;

  @ApiProperty({ description: 'Dify API基础URL', required: false })
  @IsOptional()
  @IsString()
  difyBaseUrl?: string;

  @ApiProperty({
    description: '机器人类别',
    enum: ['CUSTOMER_SERVICE', 'SALES', 'SUPPORT', 'GENERAL'],
    required: false,
  })
  @IsOptional()
  @IsIn(['CUSTOMER_SERVICE', 'SALES', 'SUPPORT', 'GENERAL'])
  category?: string;

  @ApiProperty({ description: '是否激活', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: '是否公开', required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ description: '欢迎消息', required: false })
  @IsOptional()
  @IsString()
  welcomeMessage?: string;

  @ApiProperty({ description: '兜底回复', required: false })
  @IsOptional()
  @IsString()
  fallbackMessage?: string;

  @ApiProperty({ description: '最大令牌数', required: false })
  @IsOptional()
  @IsNumber()
  maxTokens?: number;

  @ApiProperty({ description: '温度参数', required: false })
  @IsOptional()
  @IsNumber()
  temperature?: number;
}

export class UpdateBotDto {
  @ApiProperty({ description: '机器人名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '机器人描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '机器人头像URL', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: 'Dify应用ID', required: false })
  @IsOptional()
  @IsString()
  difyAppId?: string;

  @ApiProperty({ description: 'Dify API密钥', required: false })
  @IsOptional()
  @IsString()
  difyApiKey?: string;

  @ApiProperty({ description: 'Dify API基础URL', required: false })
  @IsOptional()
  @IsString()
  difyBaseUrl?: string;

  @ApiProperty({
    description: '机器人类别',
    enum: ['CUSTOMER_SERVICE', 'SALES', 'SUPPORT', 'GENERAL'],
    required: false,
  })
  @IsOptional()
  @IsIn(['CUSTOMER_SERVICE', 'SALES', 'SUPPORT', 'GENERAL'])
  category?: string;

  @ApiProperty({ description: '是否激活', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: '是否公开', required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ description: '欢迎消息', required: false })
  @IsOptional()
  @IsString()
  welcomeMessage?: string;

  @ApiProperty({ description: '兜底回复', required: false })
  @IsOptional()
  @IsString()
  fallbackMessage?: string;

  @ApiProperty({ description: '最大令牌数', required: false })
  @IsOptional()
  @IsNumber()
  maxTokens?: number;

  @ApiProperty({ description: '温度参数', required: false })
  @IsOptional()
  @IsNumber()
  temperature?: number;
}

export class BotResponseDto {
  @ApiProperty({ description: '机器人ID' })
  id: string;

  @ApiProperty({ description: '机器人名称' })
  name: string;

  @ApiProperty({ description: '机器人描述' })
  description?: string;

  @ApiProperty({ description: '机器人头像URL' })
  avatar?: string;

  @ApiProperty({ description: 'Dify应用ID', required: false })
  difyAppId?: string;

  @ApiProperty({ description: '机器人类别' })
  category: string;

  @ApiProperty({ description: '是否激活' })
  isActive: boolean;

  @ApiProperty({ description: '是否公开' })
  isPublic: boolean;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}
