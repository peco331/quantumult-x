# 网上国网 Quantumult X 签到

仓库：<https://github.com/peco331/quantumult-x>。上游原版来自 `MaYIHEI/paperclip` 的 `cbb3c47746ae633d1f818a21a6f1a5af7fda2d10`，存于 `upstream/`；本项目审计及加固见 [AUDIT.md](AUDIT.md)。生产脚本固定到自有提交 `6cf4f4e23d68f59f99df88043dccfa5ff335b4cd`，不会随 `main` 更新而自动改变。

- 抓取脚本：<https://raw.githubusercontent.com/peco331/quantumult-x/6cf4f4e23d68f59f99df88043dccfa5ff335b4cd/scripts/sgcc/qx/sgcc.capture.js>
- 签到脚本：<https://raw.githubusercontent.com/peco331/quantumult-x/6cf4f4e23d68f59f99df88043dccfa5ff335b4cd/scripts/sgcc/qx/sgcc.js>
- 手工配置参考：[sgcc.production.snippet](../../rewrites/sgcc.production.snippet)

## Quantumult X UI 安装

1. 在 QX「主机名」UI 添加或确认 `csc-service.sgcc.com.cn`。用户已手动添加时无须重复操作。
2. 在「资源 → 重写 → + → 资源路径」填入[固定版本重写资源](https://raw.githubusercontent.com/peco331/quantumult-x/bb482d9ce8cbdcc6de1d43f19a783c9ffbf994b8/rewrites/sgcc.rewrite.conf)。此文件只含一条 `script-request-body` 规则，不含任务与 hostname。
3. 在「HTTP 请求 → 任务仓库 → +」填入[固定版本任务仓库](https://raw.githubusercontent.com/peco331/quantumult-x/bb482d9ce8cbdcc6de1d43f19a783c9ffbf994b8/tasks/sgcc.gallery.json)，导入「网上国网签到(保守版)」。任务配置为每天 08:30、`enabled=false`；导入后检查自动定时确实关闭。
4. 确认 MITM 根证书已安装并受信任，开启 MITM 与 Rewrite。
5. 在 iPhone 的网上国网 App 登录个人账号，进入「我的 → 积分签到」。进入页面本身可能完成当日签到。
6. 等待「签到请求体抓取成功」和「签到凭据抓取成功」；请求体和凭据仅保存在 QX 本地 `$prefs`。Cookie 失效时重新进入该页抓取。
7. 在 QX 任务界面手动运行「网上国网签到(保守版)」。脚本只发一笔签到 POST，不重试。
8. 「今日积分签到完成 ✓」表示响应含预期字段；再到 App 核对积分状态，之后才决定是否开启自动定时。

## 失效与风险

若出现「签到未确认」或缺少凭据通知，先在 App 核对当日状态；确认会话失效后重新登录并进入积分签到页抓取，避免反复手动请求。凭据有效期由服务端决定，不能保证固定天数。自动化签到可能触发服务端风控或与服务条款冲突，最终是否使用由账号持有人判断。QX 的 MITM 根证书与本地 `$prefs` 数据需保护；不要导出、同步或提交含实际凭据的配置和抓包。
