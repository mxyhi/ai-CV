1. 启动 dify 并导入 客服机器人.yml DSL 配置相关配置，

- 知识库文件 `main1.md` 存放知识库，格式为 Markdown 语法，使用高级向量、重排序模型训练生成知识库。

```sh
cd dify/docker
copy .env.example .env # 使用默认即可
docker-compose up -d
```

2. 启动 服务端

```sh
cd server

pnpm i

npx prisma generate

pnpm run start
```

3. 启动 admin 后台

```sh
cd admin

pnpm i

pnpm run dev
```

4. 启动 客服机器人 demo

```sh
cd client-demo

pnpm i

pnpm run dev
```
