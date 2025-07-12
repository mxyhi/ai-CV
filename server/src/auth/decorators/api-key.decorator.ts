import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ApiKey = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const apiKey = request.apiKey;

    return data ? apiKey?.[data] : apiKey;
  },
);

export const BotFromApiKey = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const bot = request.bot;

    return data ? bot?.[data] : bot;
  },
);
