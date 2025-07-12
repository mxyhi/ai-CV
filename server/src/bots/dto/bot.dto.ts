import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsIn,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateBotDto {
  @ApiProperty({ description: "机器人名称" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: "机器人描述", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "机器人头像URL", required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: "Dify API密钥" })
  @IsNotEmpty()
  @IsString()
  difyApiKey: string;

  @ApiProperty({ description: "Dify API基础URL", required: false })
  @IsOptional()
  @IsString()
  difyBaseUrl?: string;

  @ApiProperty({
    description: "机器人类别",
    enum: ["CUSTOMER_SERVICE", "SALES", "SUPPORT", "GENERAL"],
    required: false,
  })
  @IsOptional()
  @IsIn(["CUSTOMER_SERVICE", "SALES", "SUPPORT", "GENERAL"])
  category?: string;

  @ApiProperty({ description: "是否激活", required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // 注意：以下字段将从 Dify API 动态获取，不需要手动设置
  // welcomeMessage, avatar, description 等将通过 BotSyncService 自动同步
}

export class UpdateBotDto {
  @ApiProperty({ description: "机器人名称", required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: "机器人描述", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "机器人头像URL", required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: "Dify API密钥", required: false })
  @IsOptional()
  @IsString()
  difyApiKey?: string;

  @ApiProperty({ description: "Dify API基础URL", required: false })
  @IsOptional()
  @IsString()
  difyBaseUrl?: string;

  @ApiProperty({
    description: "机器人类别",
    enum: ["CUSTOMER_SERVICE", "SALES", "SUPPORT", "GENERAL"],
    required: false,
  })
  @IsOptional()
  @IsIn(["CUSTOMER_SERVICE", "SALES", "SUPPORT", "GENERAL"])
  category?: string;

  @ApiProperty({ description: "是否激活", required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // 注意：name, description, avatar, welcomeMessage 等字段将从 Dify API 自动同步
  // 如需更新这些信息，请在 Dify 应用中修改，然后调用同步接口
}

export class BotResponseDto {
  @ApiProperty({ description: "机器人ID" })
  id: string;

  @ApiProperty({ description: "机器人名称" })
  name?: string;

  @ApiProperty({ description: "机器人描述" })
  description?: string;

  @ApiProperty({ description: "机器人头像URL" })
  avatar?: string;

  @ApiProperty({ description: "机器人类别" })
  category: string;

  @ApiProperty({ description: "是否激活" })
  isActive: boolean;

  @ApiProperty({ description: "欢迎消息" })
  welcomeMessage?: string;

  @ApiProperty({ description: "Dify API基础URL" })
  difyBaseUrl: string;

  @ApiProperty({ description: "创建时间" })
  createdAt: Date;

  @ApiProperty({ description: "更新时间" })
  updatedAt: Date;
}
