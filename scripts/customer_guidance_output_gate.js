"use strict";

function validateCustomerGuidanceOutput(output, expected) {
  const errors=[], holds=[];
  const text=String(output||"").replace(/\r\n/g,"\n");
  const lines=text.split("\n"), nonempty=lines.filter(x=>x.trim());
  const ev=expected.evidence||{}, shaOk=v=>/^[0-9a-f]{40}$/i.test(String(v||""));
  if(!shaOk(ev.work_start_rules_sha)||!shaOk(ev.work_start_checkpoint_sha)) errors.push("WORK_START_READBACK_EVIDENCE_MISSING");
  if(!shaOk(ev.pre_output_rules_sha)||!shaOk(ev.pre_output_checkpoint_sha)) errors.push("PRE_OUTPUT_READBACK_EVIDENCE_MISSING");
  if(expected.prior_send_history_verified!==true) holds.push("PRIOR_SEND_HISTORY_UNVERIFIED");
  if(expected.mode==="preflight") return {status:errors.length?"FAIL":holds.length?"HOLD":"PASS",errors:[...new Set(errors)],holds:[...new Set(holds)]};

  const subject="메일 제목: [해외시장자료 안내] "+expected.institution+" "+expected.name+"님";
  const email="이메일 주소: "+expected.email;
  if(nonempty[0]!==subject) errors.push("MAIL_SUBJECT_MISSING_OR_MISMATCH");
  if(nonempty[1]!==email) errors.push("EMAIL_MISSING_OR_MISMATCH");

  const reports=Array.isArray(expected.reports)?expected.reports:[];
  if(reports.length!==3) errors.push("EXPECTED_REPORT_COUNT_NOT_THREE");
  const starts=[1,2,3].map(n=>lines.findIndex(x=>x.trim()==="추천자료 "+n));
  if(starts.some(x=>x<0)||!(starts[0]<starts[1]&&starts[1]<starts[2])) errors.push("REPORT_BLOCK_ORDER_INVALID");
  const sent=new Set((expected.prior_sent_titles||[]).map(x=>String(x).trim().toLowerCase()));

  for(let i=0;i<reports.length;i++){
    const n=i+1,start=starts[i],next=i<2?starts[i+1]:lines.length;
    if(start<0||next<0) continue;
    const block=lines.slice(start,next), find=rx=>block.findIndex(x=>rx.test(x.trim()));
    const e=find(/^영문 제목:\s*\S/),k=find(/^한글 제목(?:\(참고 번역\))?:\s*\S/),p=find(/^◇ 발행사:\s*\S/),d=find(/^◇ 발행일:\s*\S/),u=find(/^자세한 내용의 링크:\s*https?:\/\//),t=find(/^목차:$/),info=find(/^보고서 정보:\s*\S/);
    if(e<0) errors.push("REPORT_"+n+"_ENGLISH_TITLE_MISSING");
    if(k<0) errors.push("REPORT_"+n+"_KOREAN_TITLE_MISSING");
    if(p<0||d<0) errors.push("REPORT_"+n+"_BOOK_INFO_MISSING");
    if(u<0) errors.push("REPORT_"+n+"_DETAIL_LINK_MISSING");
    if(info<0) errors.push("REPORT_"+n+"_REPORT_INFO_MISSING");
    const ordered=[e,k,p,d,u,t,info];
    if(ordered.some(x=>x<0)||ordered.some((x,j)=>j&&x<=ordered[j-1])) errors.push("REPORT_"+n+"_FIELD_ORDER_INVALID");
    const r=reports[i]||{};
    if(e>=0){
      const actual=block[e].trim().replace(/^영문 제목:\s*/,"");
      if(r.english_title&&actual!==r.english_title) errors.push("REPORT_"+n+"_ENGLISH_TITLE_MISMATCH");
      if(sent.has(actual.toLowerCase())) errors.push("REPORT_"+n+"_PRIOR_SENT_DUPLICATE");
    }
    if(k>=0){
      const prefix=r.korean_title_type==="reference"?"한글 제목(참고 번역): ":"한글 제목: ";
      if(!r.korean_title||block[k].trim()!==prefix+r.korean_title) errors.push("REPORT_"+n+"_KOREAN_TITLE_OR_LABEL_MISMATCH");
    }
    if(u>=0){
      const url=block[u].trim().replace(/^자세한 내용의 링크:\s*/,"");
      if(r.url&&url!==r.url) errors.push("REPORT_"+n+"_DETAIL_LINK_MISMATCH");
      if(/[?&](?:utm_[^=]+|fbclid|gclid|mc_cid|mc_eid|_ga|_gl)=|chatgpt\.com/i.test(url)) errors.push("REPORT_"+n+"_TRACKING_LINK_FORBIDDEN");
      if(/\.pdf(?:$|[?#])|brochure|\/file\//i.test(url)) errors.push("REPORT_"+n+"_BROCHURE_OR_FILE_LINK_FORBIDDEN");
    }
    if(info>=0&&!/\d/.test(block[info])) errors.push("REPORT_"+n+"_REPORT_INFO_NUMERIC_SOURCE_MISSING");
    const expectedToc=(r.toc_lines||[]).map(x=>String(x).replace(/\s+$/,""));
    if(!expectedToc.length){holds.push("REPORT_"+n+"_PUBLIC_TOC_EXPECTED_MISSING");continue;}
    if(t<0){errors.push("REPORT_"+n+"_TOC_MISSING");continue;}
    const tocEnd=info>t?info:block.length;
    const actualToc=block.slice(t+1,tocEnd).filter(x=>x.trim()).map(x=>x.replace(/\s+$/,""));
    if(actualToc.length!==expectedToc.length) errors.push("REPORT_"+n+"_TOC_INCOMPLETE");
    const num=line=>(line.trim().match(/^(\d+(?:\.\d+)*\.?|Chapter-\s*\d+)/i)||[,""])[1];
    const depth=line=>{const m=num(line).match(/\d+(?:\.\d+)*/);return m?m[0].split(".").length:((line.match(/^\s*/)||[""])[0].length?2:1);};
    if(actualToc.some(x=>depth(x)>2)) errors.push("REPORT_"+n+"_TOC_DEPTH_EXCEEDED");
    const count=Math.min(actualToc.length,expectedToc.length);
    let numberMismatch=false,indentMismatch=false,sourceMismatch=false,orderMismatch=false;
    for(let j=0;j<count;j++){
      if(num(actualToc[j])!==num(expectedToc[j])) numberMismatch=true;
      if((actualToc[j].match(/^\s*/)||[""])[0].length!==(expectedToc[j].match(/^\s*/)||[""])[0].length) indentMismatch=true;
      if(actualToc[j].trim()!==expectedToc[j].trim()) sourceMismatch=true;
    }
    const aset=actualToc.map(x=>x.trim()).sort().join("\n"),eset=expectedToc.map(x=>x.trim()).sort().join("\n");
    if(aset===eset&&actualToc.map(x=>x.trim()).join("\n")!==expectedToc.map(x=>x.trim()).join("\n")) orderMismatch=true;
    if(numberMismatch) errors.push("REPORT_"+n+"_TOC_NUMBER_MISMATCH");
    if(indentMismatch) errors.push("REPORT_"+n+"_TOC_INDENTATION_MISMATCH");
    if(orderMismatch) errors.push("REPORT_"+n+"_TOC_HIERARCHY_ORDER_MISMATCH");
    if(sourceMismatch&&!orderMismatch) errors.push("REPORT_"+n+"_TOC_SOURCE_TEXT_MISMATCH");
  }
  if(/\bPASS\b/.test(text)&&(errors.length||holds.length)) errors.push("INVALID_PASS_CLAIM");
  return {status:errors.length?"FAIL":holds.length?"HOLD":"PASS",errors:[...new Set(errors)],holds:[...new Set(holds)]};
}

function buildFixture(){
 const s="a".repeat(40),e={institution:"한국탄소산업진흥원",name:"김명곤",email:"mgkim@kcarbon.or.kr",prior_send_history_verified:true,prior_sent_titles:[],evidence:{work_start_rules_sha:s,work_start_checkpoint_sha:s,pre_output_rules_sha:s,pre_output_checkpoint_sha:s},reports:[
 {english_title:"Carbon A",korean_title:"탄소 A",korean_title_type:"reference",url:"https://publisher.example/a",toc_lines:["1. Market Overview","  1.1 Market Definition"]},
 {english_title:"Carbon B",korean_title:"탄소 B",korean_title_type:"official",url:"https://publisher.example/b",toc_lines:["1. Executive Summary","  1.1 Key Findings"]},
 {english_title:"Carbon C",korean_title:"탄소 C",korean_title_type:"official",url:"https://publisher.example/c",toc_lines:["1. Introduction","  1.1 Objectives"]}]};
 const rep=(n,r)=>["추천자료 "+n,"영문 제목: "+r.english_title,(r.korean_title_type==="reference"?"한글 제목(참고 번역): ":"한글 제목: ")+r.korean_title,"◇ 발행사: Publisher (100 Pages)","◇ 발행일: 2026-08-19 -PDF-","자세한 내용의 링크: "+r.url,"목차:",...r.toc_lines,"보고서 정보: 2026년 시장규모 100"].join("\n");
 return {expected:e,good:["메일 제목: [해외시장자료 안내] 한국탄소산업진흥원 김명곤님","이메일 주소: mgkim@kcarbon.or.kr",...e.reports.map((r,i)=>rep(i+1,r))].join("\n")};
}

function runSelfTest(){
 const b=buildFixture(),cases=[],add=(id,o,e,status,code)=>{const r=validateCustomerGuidanceOutput(o,e);if(r.status!==status||code&&!r.errors.concat(r.holds).includes(code))throw new Error(id+JSON.stringify(r));cases.push({id,status,evidence:code||"errors=0"});};
 add("VALID",b.good,b.expected,"PASS",null);
 add("TOC_DEPTH",b.good.replace("  1.1 Market Definition","    1.1.1 Market Definition"),b.expected,"FAIL","REPORT_1_TOC_DEPTH_EXCEEDED");
 add("TOC_TRUNCATED",b.good.replace("\n  1.1 Market Definition",""),b.expected,"FAIL","REPORT_1_TOC_INCOMPLETE");
 add("TOC_TRANSLATED",b.good.replace("1. Market Overview","1. 시장 개요"),b.expected,"FAIL","REPORT_1_TOC_SOURCE_TEXT_MISMATCH");
 add("NO_REPORT_INFO",b.good.replace(/^보고서 정보:[^\n]+\n/m,""),b.expected,"FAIL","REPORT_1_REPORT_INFO_MISSING");
 add("TRACKING",b.good.replace("https://publisher.example/a","https://publisher.example/a?utm_source=chatgpt.com"),b.expected,"FAIL","REPORT_1_TRACKING_LINK_FORBIDDEN");
 add("PDF_LINK",b.good.replace("https://publisher.example/a","https://publisher.example/a/brochure.pdf"),b.expected,"FAIL","REPORT_1_BROCHURE_OR_FILE_LINK_FORBIDDEN");
 const dup=JSON.parse(JSON.stringify(b.expected));dup.prior_sent_titles=["Carbon A"];add("PRIOR_DUPLICATE",b.good,dup,"FAIL","REPORT_1_PRIOR_SENT_DUPLICATE");
 const hist=JSON.parse(JSON.stringify(b.expected));hist.prior_send_history_verified=false;add("HISTORY_HOLD",b.good,hist,"HOLD","PRIOR_SEND_HISTORY_UNVERIFIED");
 const deterministic=JSON.stringify(validateCustomerGuidanceOutput(b.good,b.expected))===JSON.stringify(validateCustomerGuidanceOutput(b.good,b.expected));if(!deterministic)throw new Error("NON_DETERMINISTIC");cases.push({id:"DETERMINISTIC_REPEAT",status:"PASS",evidence:"same input same result"});
 return {cases,summary:{total:cases.length}};
}

if(typeof module!=="undefined")module.exports={validateCustomerGuidanceOutput};
if(typeof require!=="undefined"&&require.main===module){const fs=require("fs");if(process.argv.includes("--self-test")){process.stdout.write(JSON.stringify(runSelfTest(),null,2)+"\n");process.exit(0);}const o=process.argv[2],e=process.argv[3];if(!o||!e){process.stderr.write("Usage: node customer_guidance_output_gate.js <output.txt> <expected.json> | --self-test\n");process.exit(2);}const r=validateCustomerGuidanceOutput(fs.readFileSync(o,"utf8"),JSON.parse(fs.readFileSync(e,"utf8")));process.stdout.write(JSON.stringify(r,null,2)+"\n");process.exit(r.status==="PASS"?0:1);}
