# Quantumult X 配置与脚本工作区

本项目为本机 Quantumult X（iOS）的正式配置、自研与自裁脚本、分流/重写规则、审计及维护工程。遵循全局工程规范与 Project-Control 治理基线。

GitHub 仓库：<https://github.com/peco331/quantumult-x>。
当前 SGCC 生产脚本锁定本仓库提交 `6cf4f4e23d68f59f99df88043dccfa5ff335b4cd`；优先使用下方两个 Quantumult X UI 资源安装。[rewrites/sgcc.production.snippet](rewrites/sgcc.production.snippet) 仅供已有手工配置流程参考。固定提交避免后续代码变化未经审计就进入手机。
上游 `MaYIHEI/paperclip` 固定提交为 `cbb3c47746ae633d1f818a21a6f1a5af7fda2d10`。

固定脚本 URL：

- 抓取：<https://raw.githubusercontent.com/peco331/quantumult-x/6cf4f4e23d68f59f99df88043dccfa5ff335b4cd/scripts/sgcc/qx/sgcc.capture.js>
- 签到：<https://raw.githubusercontent.com/peco331/quantumult-x/6cf4f4e23d68f59f99df88043dccfa5ff335b4cd/scripts/sgcc/qx/sgcc.js>

## Quantumult X UI 安装

重写资源和任务仓库是两个独立入口，不需要编辑完整配置文件。资源文件固定到 `bb482d9ce8cbdcc6de1d43f19a783c9ffbf994b8`；它们引用的业务脚本仍固定到上面的已审计提交。

1. 在 QX「主机名」UI 添加或确认 `csc-service.sgcc.com.cn`。若此前已添加，无须重复添加。
2. 在「资源 → 重写 → + → 资源路径」添加[SGCC 重写资源](https://raw.githubusercontent.com/peco331/quantumult-x/bb482d9ce8cbdcc6de1d43f19a783c9ffbf994b8/rewrites/sgcc.rewrite.conf)。它仅匹配网上国网的签到请求体。
3. 在「HTTP 请求 → 任务仓库 → +」添加[SGCC 任务仓库](https://raw.githubusercontent.com/peco331/quantumult-x/bb482d9ce8cbdcc6de1d43f19a783c9ffbf994b8/tasks/sgcc.gallery.json)，从仓库导入「网上国网签到(保守版)」。仓库条目写有 `enabled=false`；导入后仍请在 UI 确认自动定时处于关闭状态。
4. 确认本机 MITM 证书已安装并受信任，开启 MITM 和 Rewrite。
5. 打开网上国网「我的 → 积分签到」。
6. 等待「签到请求体抓取成功」与「签到凭据抓取成功」两条通知。凭据只保存在 QX 本地；Cookie 失效时重新进入此页抓取。
7. 在 QX 任务界面手动运行「网上国网签到(保守版)」。
8. 看到「今日积分签到完成 ✓」后，再到 App 核对积分；随后自行决定是否开启每天 08:30 自动执行。

远程重写采用 [Quantumult X 官方纯文本资源示例](https://github.com/crossutility/Quantumult-X/blob/master/sample-import-rewrite.snippet)的规则行格式；任务仓库采用[官方 Gallery JSON 示例](https://github.com/crossutility/Quantumult-X/blob/master/gallery.json)的 `name`、`task`、`description` 结构。`img-url`、`addons` 均非本任务所需，故未添加。固定 commit 的 GitHub raw 地址直接提供纯文本/JSON；首次 UI 导入是否成功仍须在 iPhone 上确认。

## 目录组织

- `config/`：Quantumult X 配置文件、模块及片段模板
- `scripts/`：本地维护的脚本工程（如 `scripts/sgcc/` 网上国网等）
  - `upstream/`：上游基线与审计锁定快照（锁定特定 commit，不随意跟踪 main）
  - `qx/`：针对 Quantumult X 裁剪后的本地最小权限运行版本
- `rewrites/`：本地维护的重写规则文件（`.snippet` / `.conf` 片段）
- `tasks/`：供 QX「HTTP 请求 → 任务仓库」导入的 JSON
- `rules/`：本地维护的分流规则文件（`.list` / `.snippet`）
- `resources/`：第三方规则、上游资源清单、commit SHA 与审计溯源表
- `docs/`：排障记录、架构说明与安全边界文档
- `tools/`：配置与脚本的离线语法检查、校验脚本

## 安全与隐私铁律

1. **零凭据入库**：严禁提交真实机场订阅 URL、MITM 私钥/证书（`*.p12`、`*.pfx`、`*.mobileconfig`）、Cookie、Token、会话信息及明文密码。
2. **凭据仅本地留存**：脚本抓取的身份凭证仅存储在 Quantumult X 内部 `$prefs` 本地持久化存储中，绝不上传至任何第三方服务器或外部接口。
3. **最小权限拦截**：MITM 主机与 URL 重写正则保持最窄匹配，禁止宽泛匹配全局路径。
4. **锁 commit 引用**：第三方上游脚本必须锁定 commit SHA、落地 `upstream/` 备份并经本地安全审计后，方可制作或使用裁剪版。
