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
5. 在**尚未签到的当天**进入网上国网「我的 → 积分签到」；若需要点击签到，只点一次。若页面已显示「已签到」，且 QX 网络活动没有 `/osg-omgmt1042/member/m1/0103514`，当天没有可抓取的签到提交请求，等下一个未签到日，不要重复请求。
6. 先确认 QX 网络活动出现上述签到 URL，再等待「签到请求体抓取成功」和「签到凭据抓取成功」；数据仅保存在 QX 本地 `$prefs`。Cookie 失效时在未签到时重新抓取。若实际签到路径不同，只核对路径，不分享请求头、请求体或 Cookie。
7. 确认 QX 持久化数据中已有 `sgcc_data` 与 `sgcc_signin` 两个键；不要分享键值。抓取当天若 App 已显示「已签到」，不要再运行任务。等下一个尚未签到日，在打开签到页前，于任务界面手动运行「网上国网签到(保守版)」。脚本只发一笔签到 POST，不重试。
8. 「今日积分签到完成 ✓」表示响应含预期字段；再到 App 核对积分状态，之后才决定是否开启自动定时。

重写资源显示一条已启用规则，仅证明规则已加载；同主机的 `/osg-omgmt1042/member/c1/q034990` 等接口不会命中精准规则。任务脚本没有 `console.log`，所以空日志本身正常；缺少凭据时应查看「缺少凭据或签到数据」通知。

## 失效与风险

若出现「签到未确认」或缺少凭据通知，先在 App 核对当日状态；确认会话失效后，在下一次实际签到请求发出时重新抓取，避免反复手动请求。凭据有效期由服务端决定，不能保证固定天数。自动化签到可能触发服务端风控或与服务条款冲突，最终是否使用由账号持有人判断。QX 的 MITM 根证书与本地 `$prefs` 数据需保护；不要导出、同步或提交含实际凭据的配置和抓包。
