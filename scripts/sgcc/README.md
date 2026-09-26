# 网上国网 Quantumult X 签到

仓库：<https://github.com/peco331/quantumult-x>。上游原版来自 `MaYIHEI/paperclip` 的 `cbb3c47746ae633d1f818a21a6f1a5af7fda2d10`，存于 `upstream/`；本项目审计及加固见 [AUDIT.md](AUDIT.md)。生产脚本固定到自有提交 `6cf4f4e23d68f59f99df88043dccfa5ff335b4cd`，不会随 `main` 更新而自动改变。

- 抓取脚本：<https://raw.githubusercontent.com/peco331/quantumult-x/6cf4f4e23d68f59f99df88043dccfa5ff335b4cd/scripts/sgcc/qx/sgcc.capture.js>
- 签到脚本：<https://raw.githubusercontent.com/peco331/quantumult-x/6cf4f4e23d68f59f99df88043dccfa5ff335b4cd/scripts/sgcc/qx/sgcc.js>
- 可复制配置：[sgcc.production.snippet](../../rewrites/sgcc.production.snippet)

## 导入

1. 在 Quantumult X 的现有 `[mitm]` 段，把 `csc-service.sgcc.com.cn` **追加**到已有 `hostname` 列表。保留其他 hostname、证书和密码配置；确认本机根证书已安装并信任，MITM 与 Rewrite 开关已开启。此 hostname 会使 QX 解密该主机流量，但抓取脚本只处理特定签到 URL。
2. 将交付片段的规则行追加到现有 `[rewrite_local]`，任务行追加到现有 `[task_local]`；不要在原配置中重复创建同名段。任务保持 `enabled=false`。片段中的两个地址均锁定同一自有代码提交。
3. 在 iPhone 的网上国网 App 登录个人账号，进入「我的 / 积分签到」。App 发起真实签到请求时，抓取脚本将请求体 `data`、`skey` 以及签到执行所需请求头保存于 QX 本地 `$prefs`。看到「签到请求体抓取成功」和「签到凭据抓取成功」说明两部分均已保存。进入页面本身可能完成当日签到。
4. 在 QX 任务界面找到「网上国网签到(保守版)」并手动运行一次。脚本只向 `https://csc-service.sgcc.com.cn:28630` 发出一笔签到 POST，不重试。通知「今日积分签到完成」表示服务器响应含预期字段；仍应在 App 核对积分状态。确认后再自行决定是否开启 08:30 每日任务。

## 失效与风险

若出现「签到未确认」或缺少凭据通知，先在 App 核对当日状态；确认会话失效后重新登录并进入积分签到页抓取，避免反复手动请求。凭据有效期由服务端决定，不能保证固定天数。自动化签到可能触发服务端风控或与服务条款冲突，最终是否使用由账号持有人判断。QX 的 MITM 根证书与本地 `$prefs` 数据需保护；不要导出、同步或提交含实际凭据的配置和抓包。
