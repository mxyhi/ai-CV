import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const DifyConfig = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.difyConfig;
  },
);

export interface DifyConfigType {
  difyApiKey: string;
  difyBaseUrl: string;
  bot: any;
  apiKeyRecord: any;
}
