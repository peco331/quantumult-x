# Quantumult X 项目协作规则 (AGENTS.md)

本文件为 `D:\AI\codex\quantumult-x` 项目级 AI 协作规则，上位规则为 Project-Control 及 Global Working Rules。

## 1. 项目定位与治理

- 本项目的唯一规范路径（Canonical Path）为 `D:\AI\codex\quantumult-x`。禁止在 `D:\Projects` 或其他位置创建重复目录。
- 项目状态统一登记到 `D:\Project-Control\PROJECT_INDEX.md`，不得脱离治理平面私自变更架构。
- 中文为面向用户的说明、排障文档与审计报告语言；代码、API、配置语法、正则、路径与命令保留英文原形。

## 2. 脚本维护与审计约束

- **禁止直接跟随 upstream main**：所有第三方脚本引入时必须锁定 commit SHA，将上游原版收录至 `scripts/<name>/upstream/`，并附带 AUDIT.md 记录来源、commit、审计日期与改动区别。
- **最小权限 QX 原则**：
  1. 重写抓取规则（rewrite_local）必须仅匹配目标接口 URL，禁止宽泛拦截整个路径树；
  2. 请求头抓取仅保留目标业务必須字段，剔除 authorization 等非必要高危字段；
  3. 脚本凭据仅存储于 Quantumult X 本地持久化存储（$prefs），禁止上传任何外部服务；
  4. 定时任务（task_local）默认不连续重试，每日仅发起 1 次正式请求；
  5. 新规则与任务首次导入时默认不启用或手动验证，验证成功后方可开启定时。

## 3. 验证与提交门禁

- 所有 JavaScript 脚本须通过 Node.js 离线语法检查（`node --check`）和本地单元/模拟测试。
- 所有 Quantumult X 配置片段须符合 QX 标准语法（段落小写、规则格式、UTF-8 无 BOM）。
- 提交前必须运行 git status 与 git diff，确保无私有凭据泄漏。
