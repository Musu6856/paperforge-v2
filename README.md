# PaperForge

> Agent v2 分支：当前版本在原 PaperForge 基线之上接入 Mastra，把研究生成流程包装成可追踪的 Agent workflow，并在右侧资产栏显示最新 Agent Run。

PaperForge 是面向中文研究者的理论研究工作台，聚焦博弈论、平台经济、双边市场和相关管理科学选题。它不是“一键生成论文”的工具，而是把研究方向、模型设定、符号均衡、性质分析和论文草稿放进一条可编辑、可追踪、可导出的工作流里。

在线演示: [paperforge-sable.vercel.app](https://paperforge-sable.vercel.app/)

## 它解决什么

- 研究一开始没有结构，AI 容易发散
- 模型设定、均衡分析、性质分析之间缺少连续工作流
- 数学推导需要保持可读、可复用、可导出
- 研究资产要能在同一个工作台里统一管理

## 工作流

1. 输入一个研究想法，创建项目
2. Mastra workflow 规划并执行研究生成，右侧 Agent 页保留运行记录
3. 选择或补全模型来源，明确研究方向与关键假设
4. 生成或修正模型设定
5. 求解符号均衡
6. 需要时导出为可写进论文的格式

## 核心功能

- 三栏研究工作台，左侧项目与设置，中间对话，右侧研究资产
- 研究资产管理，方向、模型、均衡、性质分析、待处理修订项
- 结构化 AI 生成，方向发现、模型构建、符号均衡、性质分析
- 模型源配置，支持 PaperForge 托管模型或自有 DeepSeek / OpenAI / OpenAI-compatible / MiMo 模型源
- 数学渲染，Markdown + KaTeX
- 项目持久化，Clerk + Neon + Drizzle ORM
- 研究质量控制，对符号推导、资产状态和阶段流转做校验
- Vercel 部署

## 技术栈

- Next.js 16 App Router
- Mastra
- React 19
- TypeScript
- Tailwind CSS 4
- lucide-react
- shadcn/ui
- Clerk
- Neon + Drizzle ORM
- KaTeX / react-markdown
- 支持 DeepSeek、OpenAI、OpenAI-compatible、MiMo 的模型来源

## 本地开发

```bash
npm install
npm run db:push
npm run dev
```

然后打开 http://localhost:3000。

## 环境变量

在项目根目录创建 `.env.local`，至少配置以下内容:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

DATABASE_URL=postgresql://...

# 推荐：DeepSeek
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash

# 可选：通用 OpenAI-compatible 模型源
OPENAI_COMPATIBLE_API_KEY=your_openai_compatible_api_key
OPENAI_COMPATIBLE_BASE_URL=https://api.deepseek.com
OPENAI_COMPATIBLE_MODEL=deepseek-v4-flash

# 可选：MiMo 兼容来源
MIMO_API_KEY=your_mimo_api_key
MIMO_BASE_URL=https://api.xiaomimimo.com/v1
MIMO_MODEL=mimo-v2.5-pro

# 可选：OpenAI API
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-5.2
```

如果你只想先跑通本地开发，至少准备 Clerk、数据库和一个可用模型来源。服务端默认优先读取 `DEEPSEEK_API_KEY`，没有 DeepSeek 时才会继续尝试其他兼容来源。

服务端默认按 `DEEPSEEK_API_KEY` → `OPENAI_COMPATIBLE_API_KEY` → `MIMO_API_KEY` → `OPENAI_API_KEY` 的顺序选择默认模型来源。

## 质量检查

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## 当前状态

PaperForge 已经不是概念演示型原型，而是一个面向理论研究流程的工作台。后续重点会放在文献接入、推导质量、导出格式和协作能力上。
