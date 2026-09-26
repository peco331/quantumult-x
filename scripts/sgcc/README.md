# 网上国网 (SGCC) Quantumult X 积分每日签到

本模块提供国家电网官方「网上国网」App（95598）积分每日自动签到功能。经本地深度安全加固，采用最小权限匹配与严格本地存储。

## 目录结构

```text
scripts/sgcc/
├── upstream/          # 上游原版快照 (commit cbb3c47, 2026-06-22)
│   ├── README.md
│   ├── sgcc.cookie.js
│   ├── sgcc.js
│   └── sgcc.plugin
├── qx/                # Quantumult X 最小权限保守版本
│   ├── sgcc.capture.js # 精准抓取脚本（仅拦截实际签到请求，剔除 authorization）
│   ├── sgcc.js        # 每日签到执行脚本（单次请求，无重试，本地 SM3 签名）
│   ├── test_capture.js# 本地模拟单元测试
│   └── test_signin.js # 本地模拟单元测试
├── README.md          # 模块说明与使用指引
└── AUDIT.md           # 深入安全审计、差异对比与风控说明
```

## 核心加固特性

1. **窄匹配拦截**：仅匹配 `/osg-omgmt1042/member/m1/0103514`，绝不宽泛抓取整个会员模块；
2. **剔除敏感授权头**：自动剥离 `authorization` 等高危字段，仅在本地存储签到网关必需的设备及会话参数；
3. **零连续重试**：每日执行只发 1 次正式请求，从根源防范账号风控；
4. **安全本地化**：所有凭据与签名参数仅在 Quantumult X 本机持久化空间（`$prefs`）存储，不设第三方远程依赖；
5. **手动门禁**：定时任务默认关闭（`enabled=false`），必须经手动验证通过后方可激活。

---

## Quantumult X 部署与验证步骤

### 第一步：配置 MITM 解密

在 Quantumult X 配置文件 `[mitm]` 段中加入国网网关域名（若已开启可直接在 UI 界面添加）：

```ini
[mitm]
hostname = csc-service.sgcc.com.cn
```

> **前置条件**：确保已在 Quantumult X 设置中生成并信任了本地根证书，且开启了 MitM 开关。

### 第二步：添加重写抓取规则 (rewrite_local)

将精准抓取规则添加到 `[rewrite_local]`：

```ini
[rewrite_local]
^https?:\/\/csc-service\.sgcc\.com\.cn:28630\/osg-omgmt1042\/member\/m1\/0103514 url script-request-body https://raw.githubusercontent.com/local-placeholder/quantumult-x/main/scripts/sgcc/qx/sgcc.capture.js
```
*(若使用本地调试，可将路径替换为您 QX 本地文件或 iCloud 映射路径，例如 `scripts/sgcc/qx/sgcc.capture.js`)*

### 第三步：手动进入 App 触发凭据捕获

1. 手机打开 Quantumult X，确认 MitM 与 Rewrite 开关已开启；
2. 打开手机上的「网上国网」App，登录您的账号；
3. 点击底部菜单「我的」→ 点击顶部「积分签到」或进入签到页面；
4. 进入页面时，App 会自动向服务器提交签到，此时 QX 重写脚本将精确命中请求，并弹出通知：
   - `✅ 网上国网: 签到请求体抓取成功`
   - `✅ 网上国网: Cookie 凭证抓取成功`
5. 若收到上述通知，代表本地持久化凭据捕获成功。

### 第四步：手动执行签到脚本验证

在启用每日定时任务前，必须先进行手动触发测试：

1. 在 Quantumult X 配置文件 `[task_local]` 中加入任务行（默认 `enabled=false`）：

```ini
[task_local]
30 8 * * * https://raw.githubusercontent.com/local-placeholder/quantumult-x/main/scripts/sgcc/qx/sgcc.js, tag=网上国网签到(保守版), img-url=https://raw.githubusercontent.com/MaYIHEI/pin/refs/heads/main/app/sgcc.png, enabled=false
```

2. 打开 Quantumult X App → 点击底部进入配置界面 → 找到 **Task** 列表；
3. 找到「网上国网签到(保守版)」，**向左滑动**该条目，点击弹出的 **执行 / 运行 (Play)** 按钮；
4. 观察系统通知与执行日志：
   - 收到 `✅ 网上国网签到: 今日积分签到完成 ✓` 说明本地签名算法与凭证均有效；
   - 验证无误后，方可在 UI 中将该任务的开关切换为 **开启 (enabled=true)**。

---

## 凭据失效处理指引

- **有效期**：网上国网会话凭证通常有效期为 4 至 5 天；
- **失效表现**：脚本执行后收到通知 `⚠️ 网上国网签到: 签到未成功（单次执行）| 可能 Cookie/会话已过期`；
- **恢复方法**：无需修改任何配置，也切勿反复手动点击。只需在手机上打开「网上国网」App，重新进入一次「我的 / 积分签到」页面，重写抓取脚本将自动更新本地存储的有效凭据。
