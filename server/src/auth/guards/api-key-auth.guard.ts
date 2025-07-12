import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiKeysService } from '../../api-keys/api-keys.service';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(private apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // 从请求头中获取API密钥
    const apiKey = this.extractApiKeyFromRequest(request);
    
    if (!apiKey) {
      throw new UnauthorizedException('缺少API密钥');
    }

    try {
      // 验证API密钥并获取关联信息
      const validationResult = await this.apiKeysService.validateApiKey(apiKey);
      
      // 将验证结果附加到请求对象上，供后续使用
      request.apiKey = validationResult.apiKey;
      request.bot = validationResult.bot;
      
      return true;
    } catch (error) {
      throw new UnauthorizedException(error.message || '无效的API密钥');
    }
  }

  private extractApiKeyFromRequest(request: any): string | null {
    // 支持多种API密钥传递方式
    
    // 1. Authorization Bearer token
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token.startsWith('ak_')) {
        return token;
      }
    }

    // 2. X-API-Key 请求头
    const apiKeyHeader = request.headers['x-api-key'];
    if (apiKeyHeader && typeof apiKeyHeader === 'string') {
      return apiKeyHeader;
    }

    // 3. 查询参数
    const apiKeyQuery = request.query.api_key;
    if (apiKeyQuery && typeof apiKeyQuery === 'string') {
      return apiKeyQuery;
    }

    return null;
  }
}
