"use strict";

function validateCustomerGuidanceOutput(output, expected) {
  const errors = [], holds = [];
  const text = String(output || "").replace(/\r\n/g, "\n");
  const lines = text.split("\n");
  const nonempty = lines.filter((line) => line.trim() !== "");
  const ev = expected && expected.evidence || {};
  const shaOk = (v) => /^[0-9a-f]{40}$/i.test(String(v || ""));
  if (!shaOk(ev.work_start_rules_sha) || !shaOk(ev.work_start_checkpoint_sha)) errors.push("WORK_START_READBACK_EVIDENCE_MISSING");
  if (!shaOk(ev.pre_output_rules_sha) || !shaOk(ev.pre_output_checkpoint_sha)) errors.push("PRE_OUTPUT_READBACK_EVIDENCE_MISSING");

  const expectedSubject = "메일 제목: [해외시장자료 안내] " + expected.institution + " " + expected.name + "님";
  const expectedEmail = "이메일 주소: " + expected.email;
  if (nonempty[0] !== expectedSubject) errors.push("MAIL_SUBJECT_MISSING_OR_MISMATCH");
  if (nonempty[1] !== expectedEmail) errors.push("EMAIL_MISSING_OR_MISMATCH");

  const reports = Array.isArray(expected.reports) ? expected.reports : [];
  if (reports.length !== 3) errors.push("EXPECTED_REPORT_COUNT_NOT_THREE");
  const starts = [1,2,3].map((n) => lines.findIndex((line) => line.trim() === "추천자료 " + n));
  if (starts.some((x) => x < 0) || !(starts[0] < starts[1] && starts[1] < starts[2])) errors.push("REPORT_BLOCK_ORDER_INVALID");

  for (let i = 0; i < reports.length; i++) {
    const number = i + 1;
    const start = starts[i];
    const next = i < 2 ? starts[i + 1] : lines.length;
    if (start < 0 || next < 0) continue;
    const block = lines.slice(start, next);
    const find = (rx) => block.findIndex((line) => rx.test(line.trim()));
    const englishIndex = find(/^영문 제목:\s*\S/);
    const koreanIndex = find(/^한글 제목(?:\(참고 번역\))?:\s*\S/);
    const publisherIndex = find(/^◇ 발행사:\s*\S/);
    const publishedIndex = find(/^◇ 발행일:\s*\S/);
    const linkIndex = find(/^자세한 내용의 링크:\s*https?:\/\//);
    const tocIndex = find(/^목차:$/);
    if (englishIndex < 0) errors.push("REPORT_" + number + "_ENGLISH_TITLE_MISSING");
    if (koreanIndex < 0) errors.push("REPORT_" + number + "_KOREAN_TITLE_MISSING");
    if (publisherIndex < 0 || publishedIndex < 0) errors.push("REPORT_" + number + "_BOOK_INFO_MISSING");
    if (linkIndex < 0) errors.push("REPORT_" + number + "_DETAIL_LINK_MISSING");
    const ordered = [englishIndex,koreanIndex,publisherIndex,publishedIndex,linkIndex,tocIndex];
    if (ordered.some((x) => x < 0) || ordered.some((x,idx) => idx > 0 && x <= ordered[idx-1])) errors.push("REPORT_" + number + "_FIELD_ORDER_INVALID");

    const report = reports[i] || {};
    if (englishIndex >= 0 && report.english_title && block[englishIndex].trim() !== "영문 제목: " + report.english_title) errors.push("REPORT_" + number + "_ENGLISH_TITLE_MISMATCH");
    if (koreanIndex >= 0) {
      const prefix = report.korean_title_type === "reference" ? "한글 제목(참고 번역): " : "한글 제목: ";
      if (!report.korean_title || block[koreanIndex].trim() !== prefix + report.korean_title) errors.push("REPORT_" + number + "_KOREAN_TITLE_OR_LABEL_MISMATCH");
    }
    if (linkIndex >= 0) {
      const url = block[linkIndex].trim().replace(/^자세한 내용의 링크:\s*/, "");
      if (report.url && url !== report.url) errors.push("REPORT_" + number + "_DETAIL_LINK_MISMATCH");
      if (/[?&](?:utm_[^=]+|fbclid|gclid|mc_cid|mc_eid|_ga|_gl)=|chatgpt\.com/i.test(url)) errors.push("REPORT_" + number + "_TRACKING_LINK_FORBIDDEN");
    }

    const expectedToc = (report.toc_lines || []).map((line) => String(line).replace(/\s+$/, ""));
    if (!expectedToc.length) {
      holds.push("REPORT_" + number + "_PUBLIC_TOC_EXPECTED_MISSING");
      continue;
    }
    if (tocIndex < 0) {
      errors.push("REPORT_" + number + "_TOC_MISSING");
      continue;
    }
    const actualToc = block.slice(tocIndex + 1).filter((line) => line.trim() !== "").map((line) => line.replace(/\s+$/, ""));
    if (actualToc.length !== expectedToc.length) errors.push("REPORT_" + number + "_TOC_INCOMPLETE");
    const count = Math.min(actualToc.length, expectedToc.length);
    let numberMismatch=false, indentMismatch=false, hierarchyMismatch=false, sourceMismatch=false;
    const num = (line) => (line.trim().match(/^(\d+(?:\.\d+)*\.?)/) || [,""])[1];
    const indent = (line) => (line.match(/^\s*/) || [""])[0].length;
    for (let j=0;j<count;j++) {
      if (num(actualToc[j]) !== num(expectedToc[j])) numberMismatch=true;
      if (indent(actualToc[j]) !== indent(expectedToc[j])) indentMismatch=true;
      if (actualToc[j].trim() !== expectedToc[j].trim()) sourceMismatch=true;
    }
    const actualSet = actualToc.map((x)=>x.trim()).sort().join("\n");
    const expectedSet = expectedToc.map((x)=>x.trim()).sort().join("\n");
    if (actualSet === expectedSet && actualToc.map((x)=>x.trim()).join("\n") !== expectedToc.map((x)=>x.trim()).join("\n")) hierarchyMismatch=true;
    if (numberMismatch) errors.push("REPORT_" + number + "_TOC_NUMBER_MISMATCH");
    if (indentMismatch) errors.push("REPORT_" + number + "_TOC_INDENTATION_MISMATCH");
    if (hierarchyMismatch) errors.push("REPORT_" + number + "_TOC_HIERARCHY_ORDER_MISMATCH");
    if (sourceMismatch && !hierarchyMismatch && !numberMismatch) errors.push("REPORT_" + number + "_TOC_SOURCE_TEXT_MISMATCH");
  }

  if (/\bPASS\b/.test(text) && (errors.length || holds.length)) errors.push("INVALID_PASS_CLAIM");
  return { status: errors.length ? "FAIL" : holds.length ? "HOLD" : "PASS", errors, holds };
}

function buildFixture() {
  const sha = "a".repeat(40);
  const expected = {
    institution:"한국탄소산업진흥원", name:"김명곤", email:"verified@example.com",
    evidence:{work_start_rules_sha:sha,work_start_checkpoint_sha:sha,pre_output_rules_sha:sha,pre_output_checkpoint_sha:sha},
    reports:[
      {english_title:"Carbon A",korean_title:"탄소 A",korean_title_type:"reference",url:"https://publisher.example/a",toc_lines:["1. Market Overview","  1.1 Market Definition","    1.1.1 Scope"]},
      {english_title:"Carbon B",korean_title:"탄소 B",korean_title_type:"official",url:"https://publisher.example/b",toc_lines:["1. Executive Summary","  1.1 Key Findings"]},
      {english_title:"Carbon C",korean_title:"탄소 C",korean_title_type:"official",url:"https://publisher.example/c",toc_lines:["1. Introduction","  1.1 Objectives"]}
    ]
  };
  const report=(n,r)=>["추천자료 "+n,"영문 제목: "+r.english_title,(r.korean_title_type==="reference"?"한글 제목(참고 번역): ":"한글 제목: ")+r.korean_title,"◇ 발행사: Publisher ("+n+"00 Pages)    ◇ 정가: USD 1,000","◇ 발행일: 2026-08-19 -PDF-    ◆ 공급가격: 확인 필요","자세한 내용의 링크: "+r.url,"목차:",...r.toc_lines].join("\n");
  const good=["메일 제목: [해외시장자료 안내] 한국탄소산업진흥원 김명곤님","이메일 주소: verified@example.com",...expected.reports.map((r,i)=>report(i+1,r))].join("\n");
  return {expected,good};
}

function runSelfTest() {
  const base=buildFixture(), cases=[];
  const add=(id, output, expected, status, code)=>{
    const result=validateCustomerGuidanceOutput(output,expected);
    if(result.status!==status || (code && !result.errors.concat(result.holds).includes(code))) throw new Error(id+" expected "+status+"/"+code+" got "+JSON.stringify(result));
    cases.push({id,status:result.status,evidence:code||"errors=0"});
  };
  add("MAIL_SUBJECT",base.good.replace(/^메일 제목:[^\n]+\n/,""),base.expected,"FAIL","MAIL_SUBJECT_MISSING_OR_MISMATCH");
  add("EMAIL",base.good.replace(/^이메일 주소:[^\n]+\n/m,""),base.expected,"FAIL","EMAIL_MISSING_OR_MISMATCH");
  add("KOREAN_TITLE",base.good.replace(/^한글 제목\(참고 번역\):[^\n]+\n/m,""),base.expected,"FAIL","REPORT_1_KOREAN_TITLE_MISSING");
  add("KOREAN_LABEL",base.good.replace("한글 제목(참고 번역): 탄소 A","한글 제목: 탄소 A"),base.expected,"FAIL","REPORT_1_KOREAN_TITLE_OR_LABEL_MISMATCH");
  add("REPORT_ORDER",base.good.replace("추천자료 2","추천자료 4"),base.expected,"FAIL","REPORT_BLOCK_ORDER_INVALID");
  add("FIELD_ORDER",base.good.replace("영문 제목: Carbon A\n한글 제목(참고 번역): 탄소 A","한글 제목(참고 번역): 탄소 A\n영문 제목: Carbon A"),base.expected,"FAIL","REPORT_1_FIELD_ORDER_INVALID");
  add("BOOK_INFO",base.good.replace(/^◇ 발행사:[^\n]+\n/m,""),base.expected,"FAIL","REPORT_1_BOOK_INFO_MISSING");
  add("DETAIL_LINK",base.good.replace(/^자세한 내용의 링크:[^\n]+\n/m,""),base.expected,"FAIL","REPORT_1_DETAIL_LINK_MISSING");
  add("TRACKING_LINK",base.good.replace("https://publisher.example/a","https://publisher.example/a?utm_source=chatgpt.com"),base.expected,"FAIL","REPORT_1_TRACKING_LINK_FORBIDDEN");
  add("TOC_INCOMPLETE",base.good.replace("    1.1.1 Scope\n",""),base.expected,"FAIL","REPORT_1_TOC_INCOMPLETE");
  add("TOC_NUMBER",base.good.replace("  1.1 Market Definition","  1.2 Market Definition"),base.expected,"FAIL","REPORT_1_TOC_NUMBER_MISMATCH");
  add("TOC_INDENT",base.good.replace("  1.1 Market Definition","1.1 Market Definition"),base.expected,"FAIL","REPORT_1_TOC_INDENTATION_MISMATCH");
  add("TOC_HIERARCHY",base.good.replace("1. Market Overview\n  1.1 Market Definition","  1.1 Market Definition\n1. Market Overview"),base.expected,"FAIL","REPORT_1_TOC_HIERARCHY_ORDER_MISMATCH");
  const noToc=JSON.parse(JSON.stringify(base.expected)); noToc.reports[0].toc_lines=[];
  add("PUBLIC_TOC_UNAVAILABLE",base.good,noToc,"HOLD","REPORT_1_PUBLIC_TOC_EXPECTED_MISSING");
  const noStart=JSON.parse(JSON.stringify(base.expected)); noStart.evidence.work_start_rules_sha="";
  add("WORK_START_READBACK",base.good,noStart,"FAIL","WORK_START_READBACK_EVIDENCE_MISSING");
  const noPre=JSON.parse(JSON.stringify(base.expected)); noPre.evidence.pre_output_rules_sha="";
  add("PRE_OUTPUT_READBACK",base.good,noPre,"FAIL","PRE_OUTPUT_READBACK_EVIDENCE_MISSING");
  add("INVALID_PASS",base.good.replace(/^메일 제목:[^\n]+/,"PASS"),base.expected,"FAIL","INVALID_PASS_CLAIM");
  add("VALID_CUSTOMER_OUTPUT",base.good,base.expected,"PASS",null);
  return {cases,summary:{total:cases.length,pass:cases.filter(x=>x.status==="PASS").length,fail:cases.filter(x=>x.status==="FAIL").length,hold:cases.filter(x=>x.status==="HOLD").length}};
}

if (typeof module !== "undefined") module.exports={validateCustomerGuidanceOutput};
if (typeof require !== "undefined" && require.main===module){
 const fs=require("fs");
 if(process.argv.includes("--self-test")){const r=runSelfTest();process.stdout.write(JSON.stringify(r,null,2)+"\n");process.exit(0);}
 const outputPath=process.argv[2],expectedPath=process.argv[3];
 if(!outputPath||!expectedPath){process.stderr.write("Usage: node customer_guidance_output_gate.js <output.txt> <expected.json> | --self-test\n");process.exit(2);}
 const r=validateCustomerGuidanceOutput(fs.readFileSync(outputPath,"utf8"),JSON.parse(fs.readFileSync(expectedPath,"utf8")));
 process.stdout.write(JSON.stringify(r,null,2)+"\n");process.exit(r.status==="PASS"?0:1);
}
