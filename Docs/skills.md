# Skills 清单

> 开发时在对话中直接点名 skill 名称即可，例如：`用 brainstorming 先讨论方案`。

---

## Superpowers（全局）

来源：`obra/superpowers` · 路径：`~/.agents/skills/`

| 技能 | 用途 |
|------|------|
| `brainstorming` | 创意/功能开发前先头脑风暴 |
| `systematic-debugging` | 系统化调试 |
| `writing-plans` | 写实施计划 |
| `using-superpowers` | Superpowers 使用指南 |
| `requesting-code-review` | 发起代码审查 |
| `receiving-code-review` | 接收代码审查 |
| `test-driven-development` | 测试驱动开发 |
| `executing-plans` | 执行计划 |
| `subagent-driven-development` | 子代理驱动开发 |
| `verification-before-completion` | 完成前验证 |
| `dispatching-parallel-agents` | 并行调度代理 |
| `using-git-worktrees` | Git worktree 用法 |
| `finishing-a-development-branch` | 收尾开发分支 |
| `writing-skills` | 编写技能 |

---

## LuminaStudio 项目

来源：`.claude/skills/`

| 技能 | 用途 |
|------|------|
| `frontend-design-ui-ux` | UI/UX 规格与交互设计 |
| `web-design-guidelines` | 布局、排版、无障碍规范 |
| `vercel-react-best-practices` | React/Next.js 性能优化 |
| `vercel-composition-patterns` | React 组合模式、Compound Components |
| `playwright-best-practices` | Playwright 测试编写 |
| `to-prd` | 从对话生成 PRD |
| `user-research` | 用户调研与可用性测试 |

---

## 常用组合

| 场景 | 建议技能 |
|------|----------|
| 新功能 | `brainstorming` → `writing-plans` → `executing-plans` |
| 修 Bug | `systematic-debugging` |
| 小程序/UI | `frontend-design-ui-ux` + `web-design-guidelines` |
| React 重构 | `vercel-composition-patterns` + `vercel-react-best-practices` |
| 写测试 | `test-driven-development` + `playwright-best-practices` |
| 提交前 | `verification-before-completion` + `requesting-code-review` |
| 分支收尾 | `finishing-a-development-branch` |

---

## 安装与更新

```bash
# 全局安装 Superpowers
npx skills add obra/superpowers -g -y

# 搜索技能
npx skills find <关键词>
```
