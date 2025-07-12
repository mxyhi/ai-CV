import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';
import {
  CreateApiKeyDto,
  UpdateApiKeyDto,
  ApiKeyResponseDto,
  ApiKeyListResponseDto,
} from './dto/api-key.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('API密钥管理')
@Controller('bots/:botId/api-keys')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @ApiOperation({ summary: '创建API密钥' })
  @ApiParam({ name: 'botId', description: '机器人ID' })
  @ApiResponse({ status: 201, description: '创建成功', type: ApiKeyResponseDto })
  @ApiResponse({ status: 404, description: '机器人不存在' })
  @ApiResponse({ status: 403, description: '无权限' })
  async create(
    @Param('botId') botId: string,
    @Body() createApiKeyDto: CreateApiKeyDto,
    @User() user: any,
  ) {
    return this.apiKeysService.create(createApiKeyDto, botId, user.id, user.role);
  }

  @Get()
  @ApiOperation({ summary: '获取机器人的API密钥列表' })
  @ApiParam({ name: 'botId', description: '机器人ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: ApiKeyListResponseDto })
  @ApiResponse({ status: 404, description: '机器人不存在' })
  @ApiResponse({ status: 403, description: '无权限' })
  async findByBot(@Param('botId') botId: string, @User() user: any) {
    const data = await this.apiKeysService.findByBot(botId, user.id, user.role);
    return {
      data,
      total: data.length,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取API密钥详情' })
  @ApiParam({ name: 'botId', description: '机器人ID' })
  @ApiParam({ name: 'id', description: 'API密钥ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: ApiKeyResponseDto })
  @ApiResponse({ status: 404, description: 'API密钥不存在' })
  @ApiResponse({ status: 403, description: '无权限' })
  async findOne(@Param('id') id: string, @User() user: any) {
    return this.apiKeysService.findOne(id, user.id, user.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新API密钥' })
  @ApiParam({ name: 'botId', description: '机器人ID' })
  @ApiParam({ name: 'id', description: 'API密钥ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: ApiKeyResponseDto })
  @ApiResponse({ status: 404, description: 'API密钥不存在' })
  @ApiResponse({ status: 403, description: '无权限' })
  async update(
    @Param('id') id: string,
    @Body() updateApiKeyDto: UpdateApiKeyDto,
    @User() user: any,
  ) {
    return this.apiKeysService.update(id, updateApiKeyDto, user.id, user.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除API密钥' })
  @ApiParam({ name: 'botId', description: '机器人ID' })
  @ApiParam({ name: 'id', description: 'API密钥ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: 'API密钥不存在' })
  @ApiResponse({ status: 403, description: '无权限' })
  async remove(@Param('id') id: string, @User() user: any) {
    return this.apiKeysService.remove(id, user.id, user.role);
  }

  @Post(':id/regenerate')
  @ApiOperation({ summary: '重新生成API密钥' })
  @ApiParam({ name: 'botId', description: '机器人ID' })
  @ApiParam({ name: 'id', description: 'API密钥ID' })
  @ApiResponse({ status: 200, description: '重新生成成功', type: ApiKeyResponseDto })
  @ApiResponse({ status: 404, description: 'API密钥不存在' })
  @ApiResponse({ status: 403, description: '无权限' })
  async regenerate(@Param('id') id: string, @User() user: any) {
    return this.apiKeysService.regenerate(id, user.id, user.role);
  }
}

// 独立的API密钥管理控制器（不依赖于特定机器人）
@ApiTags('API密钥管理')
@Controller('api-keys')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApiKeysManagementController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Get(':id')
  @ApiOperation({ summary: '获取API密钥详情（独立接口）' })
  @ApiParam({ name: 'id', description: 'API密钥ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: ApiKeyResponseDto })
  @ApiResponse({ status: 404, description: 'API密钥不存在' })
  @ApiResponse({ status: 403, description: '无权限' })
  async findOne(@Param('id') id: string, @User() user: any) {
    return this.apiKeysService.findOne(id, user.id, user.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新API密钥（独立接口）' })
  @ApiParam({ name: 'id', description: 'API密钥ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: ApiKeyResponseDto })
  @ApiResponse({ status: 404, description: 'API密钥不存在' })
  @ApiResponse({ status: 403, description: '无权限' })
  async update(
    @Param('id') id: string,
    @Body() updateApiKeyDto: UpdateApiKeyDto,
    @User() user: any,
  ) {
    return this.apiKeysService.update(id, updateApiKeyDto, user.id, user.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除API密钥（独立接口）' })
  @ApiParam({ name: 'id', description: 'API密钥ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: 'API密钥不存在' })
  @ApiResponse({ status: 403, description: '无权限' })
  async remove(@Param('id') id: string, @User() user: any) {
    return this.apiKeysService.remove(id, user.id, user.role);
  }

  @Post(':id/regenerate')
  @ApiOperation({ summary: '重新生成API密钥（独立接口）' })
  @ApiParam({ name: 'id', description: 'API密钥ID' })
  @ApiResponse({ status: 200, description: '重新生成成功', type: ApiKeyResponseDto })
  @ApiResponse({ status: 404, description: 'API密钥不存在' })
  @ApiResponse({ status: 403, description: '无权限' })
  async regenerate(@Param('id') id: string, @User() user: any) {
    return this.apiKeysService.regenerate(id, user.id, user.role);
  }
}
