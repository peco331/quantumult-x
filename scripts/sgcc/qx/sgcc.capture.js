/**
 * 网上国网 · Quantumult X 最小权限凭证与签到请求抓取
 * 
 * 作用：打开「网上国网」App 进入「我的 / 积分签到」页触发签到时，
 * 仅精确匹配实际签到请求接口，抓取签到所需最少请求头与请求体数据存入 QX 本地持久化存储（$prefs）。
 *
 * 安全特性：
 * 1. 严格精准匹配：只匹配 /osg-omgmt1042/member/m1/0103514 接口，避免拦截整个 member 路径；
 * 2. 最小请求头：主动剔除 authorization、token 等高危敏感字段，仅保留签到必需字段；
 * 3. 严格本地化：仅写入 QX 本地 $prefs，零网络外传；
 * 4. 幂等静默：t 凭证未变时保持静默，不反复弹窗打扰。
 */

const KEY_HDR = "sgcc_data";
const KEY_ENV = "sgcc_signin";
const SIGNIN_URL = /^https:\/\/csc-service\.sgcc\.com\.cn:28630\/osg-omgmt1042\/member\/m1\/0103514(?:\?.*)?$/;

// 仅保留签到接口与服务网关实际需要的最小字段白名单（已排除 authorization 等字段）
const ALLOWED_HEADERS = [
  "t",
  "userid",
  "device_token",
  "devicetokentx",
  "devicetokentxtime",
  "appguid",
  "appguidnew",
  "wtoken",
  "appcode",
  "os",
  "version",
  "ip",
  "province",
  "language",
  "wsgwtype",
  "accessmethod",
  "user-agent"
];

function readVal(key) {
  if (typeof $prefs !== "undefined" && typeof $prefs.valueForKey === "function") {
    return $prefs.valueForKey(key);
  }
  return null;
}

function writeVal(val, key) {
  if (typeof $prefs !== "undefined" && typeof $prefs.setValueForKey === "function") {
    return $prefs.setValueForKey(val, key);
  }
  return false;
}

function notify(title, subtitle, message) {
  if (typeof $notify === "function") {
    $notify(title, subtitle, message);
  }
}

function main() {
  if (typeof $request === "undefined") {
    if (typeof $done === "function") $done({});
    return;
  }

  try {
    const url = $request.url || "";
    // 门禁 1：严格匹配实际签到请求路径，非该接口直接跳过
    if (!SIGNIN_URL.test(url)) return;

    const headers = $request.headers || {};
    const lowHeaders = {};
    for (const k in headers) {
      if (Object.prototype.hasOwnProperty.call(headers, k)) {
        lowHeaders[k.toLowerCase()] = headers[k];
      }
    }

    // 1. 抓取请求体 (data 与 skey)
    let bodyCaptured = false;
    const hadEnv = !!readVal(KEY_ENV);
    if ($request.body) {
      try {
        const bodyObj = typeof $request.body === "string" ? JSON.parse($request.body) : $request.body;
        if (bodyObj && bodyObj.data && bodyObj.skey) {
          const envData = { data: bodyObj.data, skey: bodyObj.skey };
          writeVal(JSON.stringify(envData), KEY_ENV);
          bodyCaptured = true;
          if (!hadEnv) {
            notify("✅ 网上国网", "签到请求体抓取成功", "已保存签到参数（本地存储）");
          }
        }
      } catch (e) {
        // 请求体解析异常时保持安静，避免中断网络
      }
    }

    // 2. 抓取最小必需请求头
    const t = lowHeaders["t"];
    const uid = lowHeaders["userid"];
    if (t && uid) {
      let prevT = null;
      try {
        const prev = JSON.parse(readVal(KEY_HDR) || "{}");
        prevT = prev.t;
      } catch (e) {}

      const picked = {};
      ALLOWED_HEADERS.forEach(function (k) {
        if (lowHeaders[k] != null && lowHeaders[k] !== "") {
          picked[k] = lowHeaders[k];
        }
      });
      writeVal(JSON.stringify(picked), KEY_HDR);

      // 仅在凭据首次抓取或更新时发出通知
      if (t !== prevT) {
        notify("✅ 网上国网", "签到凭据抓取成功", "已更新 Quantumult X 本地存储");
      }
    }
  } catch (err) {
    notify("⚠️ 网上国网", "抓取脚本异常", "请检查 Quantumult X 的脚本配置");
  } finally {
    if (typeof $done === "function") {
      $done({});
    }
  }
}

main();
