import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const excuse =
  "The summarizer compressed the deadline to 'soon,' and soon is not a timestamp.";

const outputDir = process.env.MAKEFUN_OUTPUT_DIR;
if (outputDir === undefined || outputDir.length === 0) {
  process.stderr.write("MAKEFUN_OUTPUT_DIR is unset\n");
  process.exit(1);
}

const entryPath = join(outputDir, "entry.txt");
writeFileSync(entryPath, excuse, { encoding: "utf8" });

const bytes = readFileSync(entryPath);
const text = bytes.toString("utf8");
const codePoints = Array.from(text).length;
const utf16Units = text.length;
const utf8Bytes = bytes.length;
const digest = createHash("sha256").update(bytes).digest("hex");

process.stdout.write(
  `code_points=${codePoints}\nutf16=${utf16Units}\nutf8_bytes=${utf8Bytes}\nsha256=${digest}\n`,
);

const printableAscii = /^[\x20-\x7E]+$/.test(text);
const withinCap =
  codePoints >= 1 &&
  codePoints <= 200 &&
  utf16Units <= 200 &&
  utf8Bytes <= 200;
const singleLine = !text.includes("\n") && !text.includes("\r");
const unpadded = text === text.trim();

if (!printableAscii || !withinCap || !singleLine || !unpadded) {
  process.stderr.write("entry.txt failed the local gate\n");
  process.exit(1);
}
