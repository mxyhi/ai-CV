import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据库...');

  // 创建管理员用户
  const adminPassword = await bcrypt.hash('admin123456', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      password: adminPassword,
      name: '系统管理员',
      role: 'ADMIN',
    },
  });

  console.log('管理员用户创建成功:', admin);

  // 创建测试用户
  const userPassword = await bcrypt.hash('user123456', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      username: 'testuser',
      password: userPassword,
      name: '测试用户',
      role: 'USER',
    },
  });

  console.log('测试用户创建成功:', user);

  // 创建系统配置
  const configs = [
    {
      key: 'SYSTEM_NAME',
      value: 'AI客服机器人管理系统',
      description: '系统名称',
    },
    {
      key: 'DEFAULT_DIFY_BASE_URL',
      value: 'http://localhost/api',
      description: '默认Dify API基础URL',
    },
    {
      key: 'MAX_BOTS_PER_USER',
      value: '10',
      description: '每个用户最大机器人数量',
    },
  ];

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config,
    });
  }

  console.log('系统配置创建成功');

  console.log('数据库初始化完成！');
  console.log('管理员账号: admin@example.com / admin123456');
  console.log('测试账号: user@example.com / user123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
