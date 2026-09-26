/**
 * 网上国网 · 每日积分签到（Quantumult X 最小权限保守版）
 *
 * 核心逻辑：
 * 1. 从 Quantumult X 本地 $prefs 读取抓取的凭据（sgcc_data）与请求参数（sgcc_signin）；
 * 2. 构造签到 POST 请求：重新计算当前时间戳与 SM3 动态签名（sign = sm3(skey + data + timestamp)）；
 * 3. 严格单次请求：每日执行默认只发 1 次请求，绝不进行原版连续 3 次重试，防范并发风控与滥用；
 * 4. 最小请求头：仅携带服务网关必需的设备/身份参数，去除敏感无关头；
 * 5. 结果通知：根据响应结果推送到 Quantumult X 通知中心，提示成功或 Cookie 失效。
 */

var __SM3=(function(){var module={exports:{}};var exports=module.exports;
!function(r,n){"object"==typeof exports&&"object"==typeof module?module.exports=n():"function"==typeof define&&define.amd?define([],n):"object"==typeof exports?exports.sm3=n():r.sm3=n()}("undefined"!=typeof self?self:this,function(){return function(r){function n(e){if(t[e])return t[e].exports;var o=t[e]={i:e,l:!1,exports:{}};return r[e].call(o.exports,o,o.exports,n),o.l=!0,o.exports}var t={};return n.m=r,n.c=t,n.d=function(r,t,e){n.o(r,t)||Object.defineProperty(r,t,{configurable:!1,enumerable:!0,get:e})},n.n=function(r){var t=r&&r.__esModule?function(){return r.default}:function(){return r};return n.d(t,"a",t),t},n.o=function(r,n){return Object.prototype.hasOwnProperty.call(r,n)},n.p="",n(n.s=6)}({1:function(r,n,t){"use strict";function e(r){if(Array.isArray(r)){for(var n=0,t=Array(r.length);n<r.length;n++)t[n]=r[n];return t}return Array.from(r)}function o(r,n){var t=31&n;return r<<t|r>>>32-t}function u(r,n){for(var t=[],e=r.length-1;e>=0;e--)t[e]=255&(r[e]^n[e]);return t}function i(r){return r^o(r,9)^o(r,17)}function f(r){return r^o(r,15)^o(r,23)}function a(r){var n=8*r.length,t=n%512;t=t>=448?512-t%448-1:448-t-1;for(var u=new Array((t-7)/8),a=new Array(8),s=0,p=u.length;s<p;s++)u[s]=0;for(var h=0,v=a.length;h<v;h++)a[h]=0;n=n.toString(2);for(var y=7;y>=0;y--)if(n.length>8){var g=n.length-8;a[y]=parseInt(n.substr(g),2),n=n.substr(0,g)}else n.length>0&&(a[y]=parseInt(n,2),n="");for(var d=new Uint8Array([].concat(e(r),[128],u,a)),w=new DataView(d.buffer,0),m=d.length/64,A=new Uint32Array([1937774191,1226093241,388252375,3666478592,2842636476,372324522,3817729613,2969243214]),b=0;b<m;b++){c.fill(0),l.fill(0);for(var x=16*b,j=0;j<16;j++)c[j]=w.getUint32(4*(x+j),!1);for(var U=16;U<68;U++)c[U]=f(c[U-16]^c[U-9]^o(c[U-3],15))^o(c[U-13],7)^c[U-6];for(var E=0;E<64;E++)l[E]=c[E]^c[E+4];for(var I=A[0],O=A[1],P=A[2],k=A[3],S=A[4],_=A[5],D=A[6],M=A[7],V=void 0,q=void 0,z=void 0,B=void 0,C=void 0,F=0;F<64;F++)C=F>=0&&F<=15?2043430169:2055708042,V=o(o(I,12)+S+o(C,F),7),q=V^o(I,12),z=(F>=0&&F<=15?I^O^P:I&O|I&P|O&P)+k+q+l[F],B=(F>=0&&F<=15?S^_^D:S&_|~S&D)+M+V+c[F],k=P,P=o(O,9),O=I,I=z,M=D,D=o(_,19),_=S,S=i(B);A[0]^=I,A[1]^=O,A[2]^=P,A[3]^=k,A[4]^=S,A[5]^=_,A[6]^=D,A[7]^=M}for(var G=[],H=0,J=A.length;H<J;H++){var K=A[H];G.push((4278190080&K)>>>24,(16711680&K)>>>16,(65280&K)>>>8,255&K)}return G}function s(r,n){for(n.length>p&&(n=a(n));n.length<p;)n.push(0);var t=u(n,h),o=u(n,v),i=a([].concat(e(t),e(r)));return a([].concat(e(o),e(i)))}for(var c=new Uint32Array(68),l=new Uint32Array(64),p=64,h=new Uint8Array(p),v=new Uint8Array(p),y=0;y<p;y++)h[y]=54,v[y]=92;r.exports={sm3:a,hmac:s}},6:function(r,n,t){"use strict";function e(r,n){return r.length>=n?r:new Array(n-r.length+1).join("0")+r}function o(r){return r.map(function(r){return r=r.toString(16),1===r.length?"0"+r:r}).join("")}function u(r){var n=[],t=r.length;t%2!=0&&(r=e(r,t+1)),t=r.length;for(var o=0;o<t;o+=2)n.push(parseInt(r.substr(o,2),16));return n}function i(r){for(var n=[],t=0,e=r.length;t<e;t++){var o=r.codePointAt(t);if(o<=127)n.push(o);else if(o<=2047)n.push(192|o>>>6),n.push(128|63&o);else if(o<=55295||o>=57344&&o<=65535)n.push(224|o>>>12),n.push(128|o>>>6&63),n.push(128|63&o);else{if(!(o>=65536&&o<=1114111))throw n.push(o),new Error("input is not supported");t++,n.push(240|o>>>18&28),n.push(128|o>>>12&63),n.push(128|o>>>6&63),n.push(128|63&o)}}return n}var f=t(1),a=f.sm3,s=f.hmac;r.exports=function(r,n){if(r="string"==typeof r?i(r):Array.prototype.slice.call(r),n){if("hmac"!==(n.mode||"hmac"))throw new Error("invalid mode");var t=n.key;if(!t)throw new Error("invalid key");return t="string"==typeof t?u(t):Array.prototype.slice.call(t),o(s(r,t))}return o(a(r))}}})});
return module.exports;})();
var sm3=(typeof __SM3==='function')?__SM3:(__SM3.sm3||__SM3.default||__SM3);

const KEY_HDR = "sgcc_data";
const KEY_ENV = "sgcc_signin";
const SIGNIN_URL = "https://csc-service.sgcc.com.cn:28630/osg-omgmt1042/member/m1/0103514";

const AUTH_KEYS = [
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

function notify(title, subtitle, message) {
  if (typeof $notify === "function") {
    $notify(title, subtitle, message);
  }
}

function main() {
  const rawHdr = readVal(KEY_HDR);
  const rawEnv = readVal(KEY_ENV);

  if (!rawHdr || !rawEnv) {
    notify("⚠️ 网上国网签到", "缺少凭据或签到数据", "请打开网上国网 App 进入「我的 / 积分签到」完成抓取");
    if (typeof $done === "function") $done({});
    return;
  }

  let hdr, env0;
  try {
    hdr = JSON.parse(rawHdr);
    env0 = JSON.parse(rawEnv);
  } catch (e) {
    notify("⚠️ 网上国网签到", "凭据数据格式错误", "本地存储损坏，请重新进 App 抓取");
    if (typeof $done === "function") $done({});
    return;
  }

  if (!hdr.t || !hdr.userid || !env0.data || !env0.skey) {
    notify("⚠️ 网上国网签到", "凭据关键字段缺失", "缺少 t/userid/data/skey，请重新进 App 抓取");
    if (typeof $done === "function") $done({});
    return;
  }

  const reqHeaders = {
    "content-type": "application/json",
    "accept": "application/json;charset=UTF-8"
  };

  AUTH_KEYS.forEach(function (k) {
    if (hdr[k] != null && hdr[k] !== "") {
      reqHeaders[k] = hdr[k];
    }
  });

  const ts = "" + Date.now();
  const signInput = env0.skey + env0.data + ts;
  const signature = sm3(signInput);

  const reqBody = {
    data: env0.data,
    sign: signature,
    skey: env0.skey,
    timestamp: ts
  };

  const req = {
    url: SIGNIN_URL,
    method: "POST",
    headers: reqHeaders,
    body: JSON.stringify(reqBody)
  };

  // 严格单次执行：不重试，保护账号安全
  if (typeof $task !== "undefined" && typeof $task.fetch === "function") {
    $task.fetch(req).then(
      function (response) {
        handleResponse(null, response, response.body);
      },
      function (reason) {
        handleResponse(reason || "网络连接错误", null, null);
      }
    );
  } else {
    // 兼容环境（如其他测试 harness）
    if (typeof $httpClient !== "undefined" && typeof $httpClient.post === "function") {
      $httpClient.post(req, function (err, resp, body) {
        handleResponse(err, resp, body);
      });
    } else {
      console.log("[SGCC] 未检测到 Quantumult X $task 环境");
      if (typeof $done === "function") $done({});
    }
  }
}

function handleResponse(err, resp, body) {
  try {
    if (err) {
      notify("⚠️ 网上国网签到", "网络请求异常", String(err).slice(0, 100));
      return;
    }

    let ok = false;
    let msg = "";
    try {
      const resJson = typeof body === "string" ? JSON.parse(body) : body;
      if (resJson && resJson.encryptData) {
        ok = true;
      } else if (resJson) {
        msg = (resJson.message || "未知响应") + (resJson.code ? " [" + resJson.code + "]" : "");
      }
    } catch (e) {
      msg = "响应解析失败: " + String(body).slice(0, 80);
    }

    if (ok) {
      notify("✅ 网上国网签到", "今日积分签到完成 ✓", "凭据有效，详细积分请在 App 内查看");
    } else {
      notify("⚠️ 网上国网签到", "签到未成功（单次执行）", "可能 Cookie/会话已过期。请打开 App 重新抓取 | " + msg);
    }
  } finally {
    if (typeof $done === "function") {
      $done({});
    }
  }
}

main();
