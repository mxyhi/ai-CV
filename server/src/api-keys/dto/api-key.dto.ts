import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsDateString,
  Min,
  Max,
  Length,
} from 'class-validator';

export class CreateApiKeyDto {
  @ApiProperty({ description: 'API密钥名称', example: '生产环境密钥' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: '权限范围', example: 'chat', required: false })
  @IsOptional()
  @IsString()
  permissions?: string;

  @ApiProperty({ description: '每小时请求限制', example: 100, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  rateLimit?: number;

  @ApiProperty({ description: '过期时间', example: '2024-12-31T23:59:59Z', required: false })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateApiKeyDto extends PartialType(CreateApiKeyDto) {
  @ApiProperty({ description: '是否激活', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ApiKeyResponseDto {
  @ApiProperty({ description: 'API密钥ID' })
  id: string;

  @ApiProperty({ description: 'API密钥名称' })
  name: string;

  @ApiProperty({ description: 'API密钥前缀' })
  keyPrefix: string;

  @ApiProperty({ description: '完整API密钥（仅在创建时返回）', required: false })
  key?: string;

  @ApiProperty({ description: '关联机器人ID' })
  botId: string;

  @ApiProperty({ description: '是否激活' })
  isActive: boolean;

  @ApiProperty({ description: '权限范围' })
  permissions: string;

  @ApiProperty({ description: '最后使用时间', required: false })
  lastUsedAt?: Date;

  @ApiProperty({ description: '使用次数' })
  usageCount: number;

  @ApiProperty({ description: '每小时请求限制', required: false })
  rateLimit?: number;

  @ApiProperty({ description: '过期时间', required: false })
  expiresAt?: Date;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;

  @ApiProperty({ description: '关联机器人信息', required: false })
  bot?: {
    id: string;
    name: string;
    description?: string;
  };
}

export class ApiKeyListResponseDto {
  @ApiProperty({ description: 'API密钥列表', type: [ApiKeyResponseDto] })
  data: ApiKeyResponseDto[];

  @ApiProperty({ description: '总数' })
  total: number;
}
