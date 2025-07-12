import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const apiKey = authorization.replace('Bearer ', '');
    
    // 查找 API Key 对应的机器人配置
    const apiKeyRecord = await this.prismaService.apiKey.findUnique({
      where: { key: apiKey, isActive: true },
      include: {
        bot: true,
      },
    });

    if (!apiKeyRecord) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('API key expired');
    }

    // 将配置信息添加到请求对象中
    request.difyConfig = {
      difyApiKey: apiKeyRecord.bot.difyApiKey,
      difyBaseUrl: apiKeyRecord.bot.difyBaseUrl,
      bot: apiKeyRecord.bot,
      apiKeyRecord,
    };

    return true;
  }
}
