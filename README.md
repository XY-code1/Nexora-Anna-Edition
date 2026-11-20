# Nexora Memory — Anna Edition

Nexora Memory — Anna Edition 是面向 Anna AI OS 的轻量个人记忆应用。用户主动提交选定的对话文本，Anna LLM 只生成**候选记忆**；候选必须由用户确认、编辑或拒绝，未经确认绝不会成为长期记忆。

> 当前状态：功能性重建与本地验证阶段。项目尚未发布到 Anna App Store，也未提交 App Review。

## 核心流程

```text
输入对话 → LLM 提取候选记忆 → 用户确认/编辑/拒绝
→ 保存已确认记忆 → 设置 AI 访问级别 → 构建最小授权上下文
```

- 候选记忆默认访问级别为 `denied`。
- 只有 `confirmed` 记忆可以设置为 `allowed` 或 `summary-only`。
- `allowed` 可返回与任务相关的已确认正文。
- `summary-only` 只返回用户可编辑的显式摘要。
- `denied`、候选记忆和已拒绝记忆不会进入授权上下文。
- 默认不保存完整原始对话；对话仅在用户提交时用于一次候选提取请求。
- 支持 JSON 导出、删除全部应用数据和生命周期审计。

## 与原 Nexora 的关系

本项目是原版 [Nexora](https://github.com/XY-code1/Nexora) 面向 Anna AI OS 的轻量适配。

原版 Nexora 仍然是 **local-first** 产品，使用用户拥有的私有 Markdown Vault。Anna Edition 不连接、不迁移也不上传原 Nexora 用户的私人 Vault；它使用 **Anna Persistent Storage（APS）云端持久化存储**。两个版本共享人工确认、最小披露和可追踪生命周期原则，但存储架构不同。

## 技术结构

- React + TypeScript + Vite
- Anna Host `llm.complete`：候选记忆提取
- Anna APS app scope：记忆、权限设置与审计事件
- 独立领域层：生命周期和最小授权上下文规则
- Vitest：只使用合成数据的领域测试

当前同步流程不需要 Executa。`executas/memory-service/` 仅记录将来后台任务边界，未在 Manifest 中申请或打包任何 Executa。

## 安装与开发

需要 Node.js 22+ 和 npm：

```bash
npm install
npm run dev
```

普通 Vite 开发环境没有 Anna Host 时，应用使用仅驻留于当前页面进程的合成内存适配器，不写入 Local Storage。真实 APS 开发需要已登录的 Anna CLI：

```bash
anna-app doctor
anna-app dev --storage aps
```

## 测试与验证

```bash
npm test
npm run typecheck
npm run build
npm run validate
```

`npm run validate` 执行 Anna CLI 的 `anna-app validate --strict`。发布前还需完成真实 APS、ETag 并发、删除证明、无障碍及合成隐私场景验证。

## 隐私说明

持久数据位于 Anna APS 的应用隔离空间，而不是本地 Markdown Vault。详细的数据处理、访问级别、导出和删除规则见 [`docs/PRIVACY.md`](docs/PRIVACY.md)。开发和自动化测试不得使用真实个人数据。

## 文档

- [`docs/FEASIBILITY.md`](docs/FEASIBILITY.md)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/PRIVACY.md`](docs/PRIVACY.md)
- [`docs/NEXORA_COMPATIBILITY.md`](docs/NEXORA_COMPATIBILITY.md)
- [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md)

## License

MIT © 2026 XY-code1。参见 [`LICENSE`](LICENSE)。

