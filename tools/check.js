const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");

console.log("=== 1. JS 语法检查 ===");
const jsFiles = [
  "scripts/sgcc/upstream/sgcc.cookie.js",
  "scripts/sgcc/upstream/sgcc.js",
  "scripts/sgcc/qx/sgcc.capture.js",
  "scripts/sgcc/qx/sgcc.js",
  "scripts/sgcc/qx/test_capture.js",
  "scripts/sgcc/qx/test_signin.js"
];

jsFiles.forEach(file => {
  const fullPath = path.join(ROOT, file);
  try {
    execSync("node --check \"" + fullPath + "\"");
    console.log("PASS: " + file);
  } catch (err) {
    console.error("FAIL: " + file, err.message);
    process.exit(1);
  }
});

console.log("\n=== 2. 敏感凭据防泄漏扫描 ===");
const sensitivePatterns = [
  /ey[A-Za-z0-9_-]{25,}\.[A-Za-z0-9_-]{25,}\.[A-Za-z0-9_-]{25,}/,
  /-----BEGIN (RSA|EC|PRIVATE) KEY-----/,
  /password\s*=\s*["\x27][^"\x27]{6,}["\x27]/i,
  /https?:\/\/[^\s]*?(sub|subscribe|airport)=/i
];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.name === ".git" || ent.name === "node_modules") continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      scanDir(p);
    } else if (ent.isFile()) {
      const content = fs.readFileSync(p, "utf8");
      sensitivePatterns.forEach(pat => {
        if (pat.test(content)) {
          console.error("ALERT: 潜在敏感凭据匹配: " + pat + " in " + path.relative(ROOT, p));
          process.exit(1);
        }
      });
    }
  }
}

scanDir(ROOT);
console.log("PASS: 零敏感凭据泄漏检查通过");

console.log("\n=== 3. Quantumult X 规则片段检查 ===");
const snippetFile = path.join(ROOT, "rewrites/sgcc.production.snippet");
const snippetContent = fs.readFileSync(snippetFile, "utf8");

const requiredSections = ["[rewrite_local]", "[task_local]"];
requiredSections.forEach(sec => {
  if (!snippetContent.includes(sec)) {
    console.error("FAIL: 缺失必需段落: " + sec);
    process.exit(1);
  }
});

if (snippetContent.includes("[MITM]") || snippetContent.includes("[Rewrite]") || snippetContent.includes("[Task]")) {
  console.error("FAIL: Quantumult X 配置段落名必须全部使用小写！");
  process.exit(1);
}

const pin = "6cf4f4e23d68f59f99df88043dccfa5ff335b4cd";
const base = "https://raw.githubusercontent.com/peco331/quantumult-x/" + pin + "/scripts/sgcc/qx/";
const lines = snippetContent.split(/\r?\n/);
const rewrite = lines.find(line => line.includes("url script-request-body"));
const task = lines.find(line => line.startsWith("30 8 * * * "));
if (!rewrite || !task || !rewrite.endsWith(base + "sgcc.capture.js") ||
    task !== "30 8 * * * " + base + "sgcc.js, tag=网上国网签到(保守版), enabled=false") {
  console.error("FAIL: 生产脚本未锁定同一个代码提交");
  process.exit(1);
}
const pattern = rewrite.split(" url script-request-body ")[0];
const matcher = new RegExp(pattern);
const target = "https://csc-service.sgcc.com.cn:28630/osg-omgmt1042/member/m1/0103514";
if (!matcher.test(target) || !matcher.test(target + "?test=1") ||
    matcher.test(target + "/other") || matcher.test("https://other.example/osg-omgmt1042/member/m1/0103514")) {
  console.error("FAIL: 重写规则范围异常");
  process.exit(1);
}
if (snippetContent.includes("/main/") || lines.some(line => line.trim() === "[mitm]")) {
  console.error("FAIL: 生产片段有浮动引用、启用任务或独立 MITM 段");
  process.exit(1);
}
console.log("PASS: rewrites/sgcc.production.snippet 固定版本与默认关闭检查通过");
console.log("\n所有离线静态校验均通过！");
