import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { BotsService } from "./bots.service";
import { CreateBotDto, UpdateBotDto, BotResponseDto } from "./dto/bot.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { User } from "../auth/decorators/user.decorator";
import { BotSyncService } from "./bot-sync.service";

@ApiTags("机器人管理")
@Controller("bots")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BotsController {
  constructor(
    private readonly botsService: BotsService,
    private readonly botSyncService: BotSyncService
  ) {}

  @Post()
  @ApiOperation({ summary: "创建机器人" })
  @ApiResponse({ status: 201, description: "创建成功", type: BotResponseDto })
  @ApiResponse({ status: 403, description: "Dify应用ID已被使用" })
  async create(@Body() createBotDto: CreateBotDto, @User() user: any) {
    return this.botsService.create(createBotDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: "获取机器人列表" })
  @ApiResponse({ status: 200, description: "获取成功", type: [BotResponseDto] })
  async findAll(
    @User() user: any,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("search") search?: string
  ) {
    return this.botsService.findAll(user.id, user.role, {
      page: page || 1,
      limit: limit || 20,
      search,
    });
  }

  @Get("public")
  @ApiOperation({ summary: "获取公开机器人列表" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async findPublicBots() {
    return this.botsService.findPublicBots();
  }

  @Get(":id")
  @ApiOperation({ summary: "获取机器人详情" })
  @ApiResponse({ status: 200, description: "获取成功", type: BotResponseDto })
  @ApiResponse({ status: 404, description: "机器人不存在" })
  @ApiResponse({ status: 403, description: "无权访问" })
  async findOne(@Param("id") id: string, @User() user: any) {
    return this.botsService.findOne(id, user.id, user.role);
  }

  @Patch(":id")
  @ApiOperation({ summary: "更新机器人" })
  @ApiResponse({ status: 200, description: "更新成功", type: BotResponseDto })
  @ApiResponse({ status: 404, description: "机器人不存在" })
  @ApiResponse({ status: 403, description: "无权修改" })
  async update(
    @Param("id") id: string,
    @Body() updateBotDto: UpdateBotDto,
    @User() user: any
  ) {
    return this.botsService.update(id, updateBotDto, user.id, user.role);
  }

  @Delete(":id")
  @ApiOperation({ summary: "删除机器人" })
  @ApiResponse({ status: 200, description: "删除成功" })
  @ApiResponse({ status: 404, description: "机器人不存在" })
  @ApiResponse({ status: 403, description: "无权删除" })
  async remove(@Param("id") id: string, @User() user: any) {
    return this.botsService.remove(id, user.id, user.role);
  }

  @Post(":id/sync")
  @ApiOperation({ summary: "从 Dify API 同步机器人信息" })
  @ApiResponse({ status: 200, description: "同步成功", type: BotResponseDto })
  @ApiResponse({ status: 404, description: "机器人不存在" })
  @ApiResponse({ status: 403, description: "无权操作" })
  async syncBot(@Param("id") id: string, @User() user: any) {
    // 检查权限
    await this.botsService.findOne(id, user.id, user.role);
    return this.botSyncService.syncBotFromDify(id);
  }

  @Post(":id/validate")
  @ApiOperation({ summary: "验证 Dify API 连接" })
  @ApiResponse({ status: 200, description: "验证成功" })
  @ApiResponse({ status: 404, description: "机器人不存在" })
  @ApiResponse({ status: 403, description: "无权操作" })
  async validateDifyConnection(@Param("id") id: string, @User() user: any) {
    // 检查权限
    const bot = await this.botsService.findOne(id, user.id, user.role);
    return this.botSyncService.validateDifyConnection(
      bot.difyApiKey,
      bot.difyBaseUrl
    );
  }
}
