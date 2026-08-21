#!/usr/bin/env node

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { randomBytes, scryptSync } = require("crypto");
const pw = process.argv[2];
if (!pw) {
  console.error("Usage: node gen_scrypt_hash.js <password>");
  process.exit(2);
}
const salt = randomBytes(16).toString("hex");
const hash = scryptSync(pw, salt, 64).toString("hex");
console.log(`scrypt$${salt}$${hash}`);
