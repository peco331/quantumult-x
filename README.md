# Quantumult X 配置与脚本工作区

本项目为本机 Quantumult X（iOS）的正式配置、自研与自裁脚本、分流/重写规则、审计及维护工程。遵循全局工程规范与 Project-Control 治理基线。

## 目录组织

- `config/`：Quantumult X 配置文件、模块及片段模板
- `scripts/`：本地维护的脚本工程（如 `scripts/sgcc/` 网上国网等）
  - `upstream/`：上游基线与审计锁定快照（锁定特定 commit，不随意跟踪 main）
  - `qx/`：针对 Quantumult X 裁剪后的本地最小权限运行版本
- `rewrites/`：本地维护的重写规则文件（`.snippet` / `.conf` 片段）
- `rules/`：本地维护的分流规则文件（`.list` / `.snippet`）
- `resources/`：第三方规则、上游资源清单、commit SHA 与审计溯源表
- `docs/`：排障记录、架构说明与安全边界文档
- `tools/`：配置与脚本的离线语法检查、校验脚本

## 安全与隐私铁律

1. **零凭据入库**：严禁提交真实机场订阅 URL、MITM 私钥/证书（`*.p12`、`*.pfx`、`*.mobileconfig`）、Cookie、Token、会话信息及明文密码。
2. **凭据仅本地留存**：脚本抓取的身份凭证仅存储在 Quantumult X 内部 `$prefs` 本地持久化存储中，绝不上传至任何第三方服务器或外部接口。
3. **最小权限拦截**：MITM 主机与 URL 重写正则保持最窄匹配，禁止宽泛匹配全局路径。
4. **锁 commit 引用**：第三方上游脚本必须锁定 commit SHA、落地 `upstream/` 备份并经本地安全审计后，方可制作或使用裁剪版。
