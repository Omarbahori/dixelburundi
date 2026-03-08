import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.log("Usage: npm run gen:admin -- <password>");
  process.exit(1);
}

const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);
const b64 = Buffer.from(hash, "utf8").toString("base64");

console.log(hash);
console.log("");
console.log("ADMIN_PASSWORD_HASH_B64=" + b64);
