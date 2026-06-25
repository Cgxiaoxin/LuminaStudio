# LuminaStudio 启动方式

这是一个 **npm workspaces 单仓**，三个应用在 `apps/` 下，**在仓库根目录**执行命令即可。

---

## 一、首次准备（只做一次）

```bash
# 1. 安装依赖
npm install

# 2. 配置后端环境变量
cp apps/server/.env.example apps/server/.env
# 编辑 apps/server/.env，至少配置：
# DATABASE_URL="mysql://root:你的密码@localhost:3306/luminastudio"
# JWT_SECRET="任意密钥"

# 3. 建库 + 建表 + 灌入演示数据（一条命令）
npm run db:setup
```

本地 MySQL 已部署时，确保 `apps/server/.env` 里的密码正确，然后执行 `npm run db:setup` 即可。

---

## 二、日常开发启动

需要 **3 个终端**（或按需只开后端 + 后台）：

| 终端 | 命令 | 访问地址 |
|------|------|----------|
| 1 | `npm run dev:server` | API：`http://localhost:3000/api` |
| 2 | `npm run dev:admin` | 管理后台：`http://localhost:5173` |
| 3（可选） | `npm run dev:miniapp` | 微信小程序（见下方说明） |

店主：admin / admin123（OWNER，后台全功能）
教练：coach1 / coach123（COACH，已绑定主店，可登录后台）

**微信小程序开发者工具：**

1. 先在终端运行 `npm run dev:miniapp`，等待编译完成（产物在 `apps/miniapp/dist/`）
2. 用微信开发者工具**导入本项目根目录** `LuminaStudio`（`project.config.json` 已配置 `miniprogramRoot` 指向 `apps/miniapp/dist/`）
3. 若模拟器仍提示找不到 `app.json`，请确认 `dev:miniapp` 终端无报错，并在开发者工具中点击「编译」刷新

也可直接导入 `apps/miniapp/dist` 目录（需先完成一次编译）。

**本地联调提示：** 在开发者工具「详情 → 本地设置」中勾选 **不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书**，否则无法访问 `http://localhost:3000` 后端 API。根目录 `project.config.json` 已设置 `"urlCheck": false`，重新导入项目或点击「编译」后生效。

**真机调试（重要）：** 手机上的 `localhost` 指向手机自身，无法访问电脑上的后端。请按以下步骤操作：

1. 在电脑上运行 `ipconfig`，找到局域网 IPv4 地址（如 `192.168.0.185`）
2. 编辑 `apps/miniapp/.env.development.local`（已为你预置，请确认 IP 正确）：
   ```env
   TARO_APP_API=http://你的IP:3000/api
   ```
3. **重新运行** `npm run dev:miniapp`（修改 env 后必须重新编译）
4. 登录页会显示当前 API 地址，确认真机上是局域网 IP 而非 `localhost`
5. 在手机浏览器访问 `http://你的IP:3000/api/health`，应返回 `{"status":"ok",...}`
6. 若手机浏览器也打不开，多半是 **Windows 防火墙** 拦截了 3000 端口。以管理员身份运行 PowerShell：
   ```powershell
   netsh advfirewall firewall add rule name="LuminaStudio Dev API 3000" dir=in action=allow protocol=TCP localport=3000
   ```
7. 确保手机与电脑在同一 WiFi，且未连接「访客网络」（部分路由器会隔离设备）

小程序界面默认为 **中文**。

**推荐启动顺序**：先 `dev:server`，再 `dev:admin`（后台依赖 API）。

---

## 三、登录信息

### 管理后台

访问：<http://localhost:5173/login>

| 字段 | 值 |
|------|-----|
| Tenant ID | `1` |
| 用户名 | `admin` |
| 密码 | `admin123` |

### 界面语言

管理后台默认 **简体中文**，支持切换为英文：

- **登录页**：右上角语言选择器
- **登录后**：左侧边栏底部语言选择器
- 选择会保存在浏览器本地，下次访问自动沿用

如需新增语言，在 `apps/admin/src/i18n/locales/` 添加语言包并在 `locales/index.ts` 注册即可。

### 小程序

打开后会进入登录页，点击「微信登录」。未配置真实 `WECHAT_APPID` 时走 dev 模式，可正常联调。

---

## 四、其他常用命令

```bash
npm run prisma:seed   # 重新灌演示数据
npm run test:server   # 单元测试
npm run e2e           # 端到端 API 流程测试（需后端已启动）
npm run build         # 构建全部应用
```

---

## 五、结构示意

```
根目录
├── npm run dev:server  →  apps/server   (NestJS, :3000)
├── npm run dev:admin   →  apps/admin    (Vite + React, :5173)
└── npm run dev:miniapp →  apps/miniapp  (Taro 微信小程序)
```

数据库相关脚本在 `apps/server` 下，根目录通过 `npm run db:setup`、`npm run prisma:seed` 等命令转发调用。
