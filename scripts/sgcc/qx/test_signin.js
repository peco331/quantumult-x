
// 模拟 Quantumult X 环境测试 sgcc.js
const assert = require("assert");

const store = {
  "sgcc_data": JSON.stringify({
    t: "mock_t_val",
    userid: "mock_user_12345",
    device_token: "dev_tok",
    "user-agent": "SGCC/5.0.0"
  }),
  "sgcc_signin": JSON.stringify({
    data: "test_data_body",
    skey: "test_skey_val"
  })
};

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

let fetchedRequest = null;
let fetchCount = 0;
global.$task = {
  fetch: (req) => {
    fetchCount++;
    fetchedRequest = req;
    return Promise.resolve({
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ encryptData: "mock_encrypted_sign_success_token" })
    });
  }
};

delete require.cache[require.resolve("./sgcc.js")];
require("./sgcc.js");

setTimeout(() => {
  assert.strictEqual(fetchCount, 1, "只应发起 1 次签到请求（禁止连续重试）");
  assert.ok(fetchedRequest, "必须发出请求");
  assert.strictEqual(fetchedRequest.url, "https://csc-service.sgcc.com.cn:28630/osg-omgmt1042/member/m1/0103514");
  assert.strictEqual(fetchedRequest.headers.t, "mock_t_val");
  assert.strictEqual(fetchedRequest.headers.userid, "mock_user_12345");
  assert.strictEqual(fetchedRequest.headers.authorization, undefined, "请求头不能包含 authorization");
  
  const parsedBody = JSON.parse(fetchedRequest.body);
  assert.strictEqual(parsedBody.data, "test_data_body");
  assert.strictEqual(parsedBody.skey, "test_skey_val");
  assert.ok(parsedBody.sign, "必须包含 sign");
  assert.ok(parsedBody.timestamp, "必须包含 timestamp");
  
  assert.ok(notification, "应收到成功通知");
  assert.ok(notification.title.includes("网上国网签到"), "通知标题正确");
  assert.ok(notification.sub.includes("今日积分签到完成"), "通知内容正确");
  assert.strictEqual(doneCalled, true, "done 必须调用");

  console.log("sgcc.js 模拟测试全部 PASS");
}, 100);
