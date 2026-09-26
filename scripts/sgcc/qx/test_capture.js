
// 模拟 Quantumult X 环境测试 sgcc.capture.js
const assert = require("assert");

const store = {};
global.$prefs = {
  valueForKey: (k) => store[k] || null,
  setValueForKey: (v, k) => { store[k] = v; return true; }
};

let notification = null;
global.$notify = (title, sub, msg) => {
  notification = { title, sub, msg };
};

let doneCalled = false;
global.$done = (obj) => {
  doneCalled = true;
};

// 1. 测试非匹配 URL（应该直接 pass-through，不写存储）
global.$request = {
  url: "https://csc-service.sgcc.com.cn:28630/osg-omgmt1042/other/path",
  headers: { "T": "token123", "Userid": "u123", "Authorization": "Bearer secret" },
  body: JSON.stringify({ data: "d1", skey: "s1" })
};

delete require.cache[require.resolve("./sgcc.capture.js")];
require("./sgcc.capture.js");

assert.strictEqual(store["sgcc_data"], undefined, "非签到路径不应抓取凭据");
assert.strictEqual(store["sgcc_signin"], undefined, "非签到路径不应抓取签到体");
assert.strictEqual(doneCalled, true, "done 必须被调用");

// 2. 测试精确匹配 /osg-omgmt1042/member/m1/0103514
doneCalled = false;
notification = null;
global.$request = {
  url: "https://csc-service.sgcc.com.cn:28630/osg-omgmt1042/member/m1/0103514",
  headers: {
    "T": "token_test_abc_123",
    "UserId": "1000123456",
    "Authorization": "Bearer HIGH_RISK_AUTH_TOKEN_SHOULD_BE_DROPPED",
    "device_token": "dev_tok_1",
    "appguid": "guid_1",
    "user-agent": "SGCC/5.0.0"
  },
  body: JSON.stringify({ data: "payload_data_xyz", skey: "skey_abc" })
};

delete require.cache[require.resolve("./sgcc.capture.js")];
require("./sgcc.capture.js");

assert.ok(store["sgcc_signin"], "签到体应被抓取");
const signinObj = JSON.parse(store["sgcc_signin"]);
assert.strictEqual(signinObj.data, "payload_data_xyz");
assert.strictEqual(signinObj.skey, "skey_abc");
assert.strictEqual(signinObj.path, "/osg-omgmt1042/member/m1/0103514");

assert.ok(store["sgcc_data"], "凭据头应被抓取");
const hdrObj = JSON.parse(store["sgcc_data"]);
assert.strictEqual(hdrObj.t, "token_test_abc_123");
assert.strictEqual(hdrObj.userid, "1000123456");
assert.strictEqual(hdrObj.authorization, undefined, "authorization 必须被剔除！");
assert.strictEqual(hdrObj["user-agent"], "SGCC/5.0.0");
assert.ok(notification, "应触发抓取成功通知");

console.log("sgcc.capture.js 模拟测试全部 PASS");
