# 第三方资源清单与审计记录 (resources/RESOURCES.md)

| 资源名称 | 上游仓库 / 作者 | 锁定 Commit SHA | 本地 upstream 路径 | 审计日期 | 本地改造版本 | 当前用途 |
|---|---|---|---|---|---|---|
| 网上国网签到 (SGCC) | [MaYIHEI/paperclip](https://github.com/MaYIHEI/paperclip) | `cbb3c47746ae633d1f818a21a6f1a5af7fda2d10` | `scripts/sgcc/upstream/` | 2026-09-26 | `scripts/sgcc/qx/` | 每日积分签到（保守裁剪：窄正则匹配、剥离 authorization、单次执行不重试、本地存储、默认手动） |

自有公开仓库：<https://github.com/peco331/quantumult-x>。生产脚本提交：`6cf4f4e23d68f59f99df88043dccfa5ff335b4cd`。

- 抓取脚本：<https://raw.githubusercontent.com/peco331/quantumult-x/6cf4f4e23d68f59f99df88043dccfa5ff335b4cd/scripts/sgcc/qx/sgcc.capture.js>
- 签到脚本：<https://raw.githubusercontent.com/peco331/quantumult-x/6cf4f4e23d68f59f99df88043dccfa5ff335b4cd/scripts/sgcc/qx/sgcc.js>

自有版限制抓取至单一签到接口、移除 `authorization`、仅存本机 `$prefs`、每次执行单次 POST，任务默认关闭。固定提交防止 `main` 后续更新自动改变 QX 正在执行的敏感脚本。

## Quantumult X UI 安装

两个 UI 资源固定到资源提交 `bb482d9ce8cbdcc6de1d43f19a783c9ffbf994b8`，引用的 SGCC 业务脚本仍固定到 `6cf4f4e23d68f59f99df88043dccfa5ff335b4cd`。

1. 「主机名」UI 添加或确认 `csc-service.sgcc.com.cn`；它不由重写资源重复添加。
2. 「资源 → 重写 → + → 资源路径」添加[单规则重写资源](https://raw.githubusercontent.com/peco331/quantumult-x/bb482d9ce8cbdcc6de1d43f19a783c9ffbf994b8/rewrites/sgcc.rewrite.conf)。
3. 「HTTP 请求 → 任务仓库 → +」添加[单任务 Gallery JSON](https://raw.githubusercontent.com/peco331/quantumult-x/bb482d9ce8cbdcc6de1d43f19a783c9ffbf994b8/tasks/sgcc.gallery.json)，导入后确认自动执行关闭。
4. 开启 MITM 与 Rewrite，并确认根证书受信任。
5. 打开网上国网「我的 → 积分签到」。
6. 等待「签到请求体抓取成功」与「签到凭据抓取成功」。凭据仅保存在 QX 本地；Cookie 失效时重新进入该页抓取。
7. 在任务界面手动运行「网上国网签到(保守版)」。
8. 收到「今日积分签到完成 ✓」后到 App 核对，再决定是否开启每天 08:30 的自动定时。

格式依据：[Quantumult X 官方重写资源示例](https://github.com/crossutility/Quantumult-X/blob/master/sample-import-rewrite.snippet)、[官方任务仓库示例](https://github.com/crossutility/Quantumult-X/blob/master/gallery.json)、[官方 URL Scheme 文档](https://github.com/crossutility/Quantumult-X/blob/master/url-scheme.md)。Gallery 顶层使用 `name`、`task`、`description`；单任务用 `config` 字符串承载 cron、脚本 URL、`tag` 和 `enabled=false`。图标的字段名为 `img-url`，本任务未使用；`addons` 也未使用。GitHub raw 端点返回资源原文，实际 QX UI 导入仍需手机侧确认。

## 引入原则

1. **禁止直接跟踪 main**：任何从外部引入的 snippet、js、list 必须锁定 commit SHA 并保留一份未经修改的原始快照至对应的 `upstream/` 目录中。
2. **审计差异透明化**：每次基于上游产出裁剪版时，必须在对应功能目录下编写 `AUDIT.md`，详尽对照上游实现与本地安全加固点。
3. **零敏感数据**：资源清单中绝不记录用户私有凭据、机场订阅及 MITM 私钥。
