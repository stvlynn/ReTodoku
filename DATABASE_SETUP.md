# ReTodoku 数据库设置指南

本项目使用 Cloudflare D1 数据库来存储用户、明信片模板和已发送明信片的数据。

## 数据库架构

### 表结构

1. **users** - 用户信息
   - `id` (INTEGER PRIMARY KEY) - 用户ID
   - `name` (TEXT) - 用户姓名
   - `handle` (TEXT) - 用户名/邮箱
   - `platform` (TEXT) - 平台类型 (twitter, telegram, email, other)
   - `avatar_url` (TEXT) - 头像URL (使用unavatar服务)
   - `created_at`, `updated_at` - 时间戳

2. **postcard_templates** - 明信片模板
   - `id` (INTEGER PRIMARY KEY) - 模板ID
   - `name` (TEXT) - 模板名称
   - `image_url` (TEXT) - 图片URL
   - `description` (TEXT) - 描述
   - `is_active` (BOOLEAN) - 是否激活
   - `created_at` - 创建时间

3. **sent_postcards** - 已发送明信片
   - `id` (INTEGER PRIMARY KEY) - 明信片ID
   - `sender_id`, `recipient_id`, `template_id` - 外键关联
   - `message` (TEXT) - 消息内容
   - `status` (TEXT) - 状态 (pending, in_transit, delivered, failed)
   - `receipt_method` (TEXT) - 接收方式 (shipping, meetup)
   - `shipping_address`, `meetup_date`, `meetup_location` - 配送信息
   - `sent_at`, `delivered_at` - 时间戳

4. **meetup_photos** - 聚会照片
   - `id` (INTEGER PRIMARY KEY) - 照片ID
   - `postcard_id` (INTEGER) - 关联明信片
   - `photo_url` (TEXT) - 照片URL
   - `caption` (TEXT) - 照片说明
   - `uploaded_at` - 上传时间

## 设置步骤

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 创建 D1 数据库

```bash
# 开发环境
wrangler d1 create retodoku-dev-db

# 生产环境
wrangler d1 create retodoku-prod-db
```

### 4. 更新 wrangler.toml

将创建数据库时返回的 `database_id` 填入 `wrangler.toml` 文件中对应的位置。

### 5. 运行数据库迁移

```bash
# 开发环境
wrangler d1 migrations apply retodoku-dev-db --local

# 生产环境
wrangler d1 migrations apply retodoku-prod-db
```

### 6. 验证数据库

```bash
# 查看表结构
wrangler d1 execute retodoku-dev-db --command="SELECT name FROM sqlite_master WHERE type='table';"

# 查看种子数据
wrangler d1 execute retodoku-dev-db --command="SELECT * FROM users LIMIT 5;"
```

## 开发环境配置

### 本地开发

在开发环境中，项目使用 mock 数据服务 (`MockDatabaseService`)，无需实际的 D1 数据库连接。

### 生产环境部署

1. 确保 `wrangler.toml` 中的数据库配置正确
2. 部署到 Cloudflare Pages 或 Workers
3. 在部署环境中绑定 D1 数据库

## 数据库操作

### 使用 DatabaseService 类

```typescript
import { DatabaseService } from '@/lib/database';

// 在 Cloudflare Worker 中
const dbService = new DatabaseService(env.DB);

// 获取用户
const users = await dbService.getUsers();

// 创建明信片
const postcard = await dbService.createSentPostcard({
  sender_id: 1,
  recipient_id: 2,
  template_id: 1,
  message: "Hello from Tokyo!",
  status: "pending",
  receipt_method: "shipping",
  sent_at: new Date().toISOString()
});
```

### 使用 React Hook

```typescript
import { useDatabase } from '@/hooks/useDatabase';

function MyComponent() {
  const { users, postcardTemplates, sentPostcards, loading, error } = useDatabase();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {sentPostcards.map(postcard => (
        <div key={postcard.id}>{postcard.message}</div>
      ))}
    </div>
  );
}
```

## 环境变量

复制 `env.example` 到 `.env.local` 并填入实际值：

```bash
cp env.example .env.local
```

## 数据迁移

### 添加新迁移

```bash
wrangler d1 migrations create retodoku-db "add_new_feature"
```

### 应用迁移

```bash
# 本地
wrangler d1 migrations apply retodoku-dev-db --local

# 生产
wrangler d1 migrations apply retodoku-prod-db
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 `wrangler.toml` 中的 `database_id` 是否正确
   - 确认已运行数据库迁移

2. **权限错误**
   - 确保已通过 `wrangler login` 登录
   - 检查 Cloudflare 账户权限

3. **迁移失败**
   - 检查 SQL 语法是否正确
   - 确认表名和字段名没有冲突

### 调试命令

```bash
# 查看数据库信息
wrangler d1 info retodoku-dev-db

# 执行 SQL 查询
wrangler d1 execute retodoku-dev-db --command="SELECT COUNT(*) FROM users;"

# 查看迁移状态
wrangler d1 migrations list retodoku-dev-db
```

## 性能优化

1. **索引优化** - 已在 schema 中添加必要索引
2. **查询优化** - 使用 JOIN 减少查询次数
3. **分页** - 对大量数据使用 LIMIT 和 OFFSET
4. **缓存** - 考虑使用 Cloudflare KV 缓存频繁查询的数据

## 安全考虑

1. **SQL 注入防护** - 使用参数化查询 (prepared statements)
2. **数据验证** - 在应用层验证输入数据
3. **访问控制** - 通过 Cloudflare Access 控制数据库访问
4. **备份** - 定期备份生产数据库 