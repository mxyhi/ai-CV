import { Module } from "@nestjs/common";
import { DifyService } from "./dify.service";
import { DifyProxyController } from "./dify-proxy.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [DifyProxyController],
  providers: [DifyService],
  exports: [DifyService],
})
export class DifyModule {}
