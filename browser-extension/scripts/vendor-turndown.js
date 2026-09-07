#!/usr/bin/env node
/** Copy published turndown IIFE + LICENSE into vendor/ for Chrome content scripts. */
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const pkg = path.join(root, "node_modules", "turndown");
const outDir = path.join(root, "vendor", "turndown");

const srcJs = path.join(pkg, "dist", "turndown.js");
const srcLicense = path.join(pkg, "LICENSE");

if (!fs.existsSync(srcJs)) {
  console.error("turndown not installed; run npm install first");
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });
fs.copyFileSync(srcJs, path.join(outDir, "turndown.js"));
fs.copyFileSync(srcLicense, path.join(outDir, "LICENSE"));
console.log("vendored turndown → vendor/turndown/");
