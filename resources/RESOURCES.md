# 第三方资源清单与审计记录 (resources/RESOURCES.md)

| 资源名称 | 上游仓库 / 作者 | 锁定 Commit SHA | 本地 upstream 路径 | 审计日期 | 本地改造版本 | 当前用途 |
|---|---|---|---|---|---|---|
| 网上国网签到 (SGCC) | [MaYIHEI/paperclip](https://github.com/MaYIHEI/paperclip) | `cbb3c47746ae633d1f818a21a6f1a5af7fda2d10` | `scripts/sgcc/upstream/` | 2026-09-26 | `scripts/sgcc/qx/` | 每日积分签到（保守裁剪：窄正则匹配、剥离 authorization、单次执行不重试、本地存储、默认手动） |

自有公开仓库：<https://github.com/peco331/quantumult-x>。生产脚本提交：`6cf4f4e23d68f59f99df88043dccfa5ff335b4cd`。

- 抓取脚本：<https://raw.githubusercontent.com/peco331/quantumult-x/6cf4f4e23d68f59f99df88043dccfa5ff335b4cd/scripts/sgcc/qx/sgcc.capture.js>
- 签到脚本：<https://raw.githubusercontent.com/peco331/quantumult-x/6cf4f4e23d68f59f99df88043dccfa5ff335b4cd/scripts/sgcc/qx/sgcc.js>

自有版限制抓取至单一签到接口、移除 `authorization`、仅存本机 `$prefs`、每次执行单次 POST，任务默认关闭。固定提交防止 `main` 后续更新自动改变 QX 正在执行的敏感脚本。

## 引入原则

1. **禁止直接跟踪 main**：任何从外部引入的 snippet、js、list 必须锁定 commit SHA 并保留一份未经修改的原始快照至对应的 `upstream/` 目录中。
2. **审计差异透明化**：每次基于上游产出裁剪版时，必须在对应功能目录下编写 `AUDIT.md`，详尽对照上游实现与本地安全加固点。
3. **零敏感数据**：资源清单中绝不记录用户私有凭据、机场订阅及 MITM 私钥。
