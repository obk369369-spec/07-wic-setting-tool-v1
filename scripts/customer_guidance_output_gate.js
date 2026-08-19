"use strict";

function validateCustomerGuidanceOutput(output, expected) {
  const errors = [];
  const lines = String(output || "").replace(/\r\n/g, "\n").split("\n");
  const nonempty = lines.filter((line) => line.trim() !== "");
  const expectedSubject = "메일 제목: [해외시장자료 안내] " + expected.institution + " " + expected.name + "님";
  const expectedEmail = "이메일 주소: " + expected.email;
  if (nonempty[0] !== expectedSubject) errors.push("MAIL_SUBJECT_MISSING_OR_MISMATCH");
  if (nonempty[1] !== expectedEmail) errors.push("EMAIL_MISSING_OR_MISMATCH");

  const reports = Array.isArray(expected.reports) ? expected.reports : [];
  for (let i = 0; i < reports.length; i++) {
    const number = i + 1;
    const start = lines.findIndex((line) => line.trim() === "추천자료 " + number);
    const next = lines.findIndex((line, idx) => idx > start && line.trim() === "추천자료 " + (number + 1));
    const end = next >= 0 ? next : lines.length;
    if (start < 0) {
      errors.push("REPORT_" + number + "_BLOCK_MISSING");
      continue;
    }
    const block = lines.slice(start, end);
    const korean = block.find((line) => /^한글 제목(?:\(참고 번역\))?:\s*\S/.test(line.trim()));
    if (!korean) errors.push("REPORT_" + number + "_KOREAN_TITLE_MISSING");

    const tocIndex = block.findIndex((line) => line.trim() === "목차:");
    if (tocIndex < 0) {
      errors.push("REPORT_" + number + "_TOC_MISSING");
      continue;
    }
    const actualToc = block.slice(tocIndex + 1).filter((line) => line.trim() !== "").map((line) => line.replace(/\s+$/, ""));
    const expectedToc = (reports[i].toc_lines || []).map((line) => String(line).replace(/\s+$/, ""));
    if (actualToc.length !== expectedToc.length || actualToc.some((line, idx) => line !== expectedToc[idx])) {
      errors.push("REPORT_" + number + "_TOC_INCOMPLETE_OR_HIERARCHY_MISMATCH");
    }
  }

  if (/\bPASS\b/.test(output) && errors.length) errors.push("INVALID_PASS_CLAIM");
  return { status: errors.length ? "FAIL" : "PASS", errors };
}

function runSelfTest() {
  const expected = {
    institution: "한국탄소산업진흥원",
    name: "홍길동",
    email: "hong@example.com",
    reports: [
      { toc_lines: ["1. Market Overview", "  1.1 Market Definition", "    1.1.1 Scope"] },
      { toc_lines: ["1. Executive Summary", "  1.1 Key Findings"] },
      { toc_lines: ["1. Introduction", "  1.1 Objectives"] }
    ]
  };
  const bad = [
    "한국탄소산업진흥원 홍길동",
    "추천자료 1", "영문 제목: A", "목차:", "1. Market Overview",
    "추천자료 2", "영문 제목: B", "목차:", "1. Executive Summary",
    "추천자료 3", "영문 제목: C", "목차:", "1. Introduction", "PASS"
  ].join("\n");
  const good = [
    "메일 제목: [해외시장자료 안내] 한국탄소산업진흥원 홍길동님",
    "이메일 주소: hong@example.com",
    "추천자료 1", "영문 제목: A", "한글 제목(참고 번역): 에이", "목차:", "1. Market Overview", "  1.1 Market Definition", "    1.1.1 Scope",
    "추천자료 2", "영문 제목: B", "한글 제목: 비", "목차:", "1. Executive Summary", "  1.1 Key Findings",
    "추천자료 3", "영문 제목: C", "한글 제목: 씨", "목차:", "1. Introduction", "  1.1 Objectives"
  ].join("\n");
  const before = validateCustomerGuidanceOutput(bad, expected);
  const after = validateCustomerGuidanceOutput(good, expected);
  const required = ["MAIL_SUBJECT_MISSING_OR_MISMATCH","EMAIL_MISSING_OR_MISMATCH","REPORT_1_KOREAN_TITLE_MISSING","REPORT_1_TOC_INCOMPLETE_OR_HIERARCHY_MISMATCH","INVALID_PASS_CLAIM"];
  if (before.status !== "FAIL" || !required.every((x) => before.errors.includes(x))) throw new Error("failure reproduction did not catch required errors");
  if (after.status !== "PASS" || after.errors.length) throw new Error("fixed fixture did not pass");
  return {before, after};
}

if (typeof module !== "undefined") {
  module.exports = { validateCustomerGuidanceOutput };
}

if (typeof require !== "undefined" && require.main === module) {
  const fs = require("fs");
  if (process.argv.includes("--self-test")) {
    const result = runSelfTest();
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    process.exit(result.after.status === "PASS" ? 0 : 1);
  }
  const outputPath = process.argv[2];
  const expectedPath = process.argv[3];
  if (!outputPath || !expectedPath) {
    process.stderr.write("Usage: node customer_guidance_output_gate.js <output.txt> <expected.json> | --self-test\n");
    process.exit(2);
  }
  const output = fs.readFileSync(outputPath, "utf8");
  const expected = JSON.parse(fs.readFileSync(expectedPath, "utf8"));
  const result = validateCustomerGuidanceOutput(output, expected);
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  process.exit(result.status === "PASS" ? 0 : 1);
}
