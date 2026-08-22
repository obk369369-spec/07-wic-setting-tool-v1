"use strict";

function uniq(a){return [...new Set(a)];}
function validateCustomerGuidanceOutput(output, expected) {
  const errors=[], holds=[];
  const text=String(output||"").replace(/\r\n/g,"\n");
  const lines=text.split("\n"), nonempty=lines.filter(x=>x.trim());
  const shaOk=v=>/^[0-9a-f]{40}$/i.test(String(v||""));
  const ev=expected.evidence||{};
  if(!shaOk(ev.work_start_rules_sha)||!shaOk(ev.work_start_checkpoint_sha)) errors.push("WORK_START_READBACK_EVIDENCE_MISSING");
  if(!shaOk(ev.pre_output_rules_sha)||!shaOk(ev.pre_output_checkpoint_sha)) errors.push("PRE_OUTPUT_READBACK_EVIDENCE_MISSING");
  if(expected.feedback_evidence){
    const f=expected.feedback_evidence;
    if(!["wording","execution_error","rule_addition"].includes(f.classification)) errors.push("FEEDBACK_CLASSIFICATION_INVALID");
    if(!shaOk(f.master_commit_sha)||!shaOk(f.checkpoint_commit_sha)) errors.push("FEEDBACK_COMMIT_EVIDENCE_MISSING");
    if(f.remote_readback_match!==true) errors.push("FEEDBACK_REMOTE_READBACK_MISSING");
  }
  if(expected.prior_send_history_verified!==true) holds.push("PRIOR_SEND_HISTORY_UNVERIFIED");
  if(expected.mode==="preflight") return {status:errors.length?"FAIL":holds.length?"HOLD":"PASS",errors:uniq(errors),holds:uniq(holds)};

  const subject="메일 제목: [해외시장자료 안내] "+expected.institution+" "+expected.name+"님";
  const email="이메일 주소: "+expected.email;
  if(nonempty[0]!==subject) errors.push("MAIL_SUBJECT_MISSING_OR_MISMATCH");
  if(nonempty[1]!==email) errors.push("EMAIL_MISSING_OR_MISMATCH");

  const reports=Array.isArray(expected.reports)?expected.reports:[];
  if(reports.length!==3) errors.push("EXPECTED_REPORT_COUNT_NOT_THREE");
  const starts=[1,2,3].map(n=>lines.findIndex(x=>x.trim()==="추천자료 "+n));
  if(starts.some(x=>x<0)||!(starts[0]<starts[1]&&starts[1]<starts[2])) errors.push("REPORT_BLOCK_ORDER_INVALID");
  if(starts.filter(x=>x>=0).length!==3) errors.push("ACTUAL_REPORT_COUNT_NOT_THREE");
  if((text.match(/^추천자료\s+[123]\s*$/gm)||[]).length!==3) errors.push("ACTUAL_REPORT_COUNT_NOT_THREE");
  const sent=new Set((expected.prior_sent_titles||[]).map(x=>String(x).trim().toLowerCase()));

  for(let i=0;i<reports.length;i++){
    const n=i+1,start=starts[i],next=i<2&&starts[i+1]>=0?starts[i+1]:lines.length,r=reports[i]||{};
    if(start<0) continue;
    const block=lines.slice(start,next), find=rx=>block.findIndex(x=>rx.test(x.trim()));
    const e=find(/^##\s+영문 제목:\s*\S/), k=find(/^##\s+한글 제목(?:\(참고 번역\))?:\s*\S/);
    const p=find(/^◇ 발행사:/), d=find(/^◇ 발행일:/), u=find(/^자세한 내용의 링크:\s*https?:\/\//), t=find(/^목차:$/), info=find(/^보고서 정보:$/);
    if(e<0) errors.push(`REPORT_${n}_ENGLISH_TITLE_MISSING_OR_NOT_LARGE`);
    if(k<0) errors.push(`REPORT_${n}_KOREAN_TITLE_MISSING_OR_NOT_LARGE`);
    if(p<0) errors.push(`REPORT_${n}_PUBLISHER_PRICE_LINE_FORMAT_INVALID`);
    if(d<0) errors.push(`REPORT_${n}_PUBLISHED_SUPPLY_LINE_FORMAT_INVALID`);
    if(u<0) errors.push(`REPORT_${n}_DETAIL_LINK_MISSING`);
    if(t<0) errors.push(`REPORT_${n}_TOC_MISSING`);
    if(info<0) errors.push(`REPORT_${n}_REPORT_INFO_LABEL_MUST_BE_SEPARATE_LINE`);
    const ordered=[e,k,p,d,u,t,info];
    if(ordered.some(x=>x<0)||ordered.some((x,j)=>j&&x<=ordered[j-1])) errors.push(`REPORT_${n}_FIELD_ORDER_INVALID`);

    if(e>=0){
      const actual=block[e].trim().replace(/^##\s+영문 제목:\s*/,"");
      if(r.english_title&&actual!==r.english_title) errors.push(`REPORT_${n}_ENGLISH_TITLE_MISMATCH`);
      if(sent.has(actual.toLowerCase())) errors.push(`REPORT_${n}_PRIOR_SENT_DUPLICATE`);
    }
    if(k>=0&&r.korean_title){
      const actual=block[k].trim().replace(/^##\s+한글 제목(?:\(참고 번역\))?:\s*/,"");
      if(actual!==r.korean_title) errors.push(`REPORT_${n}_KOREAN_TITLE_MISMATCH`);
    }
    if(p>=0){
      const line=block[p].trim();
      if(r.publisher&&!line.includes("◇ 발행사: "+r.publisher)) errors.push(`REPORT_${n}_PUBLISHER_MISMATCH`);
      if(r.pages&&!line.includes(`( ${r.pages} Pages )`)&&!line.includes(`(${r.pages} Pages)`)) errors.push(`REPORT_${n}_PAGES_MISMATCH`);
      if(r.price_display&&!line.includes("◇ 정가: "+r.price_display)) errors.push(`REPORT_${n}_PRICE_MISMATCH`);
      if(!/\(\s*[^)]*Pages\s*\).*◇ 정가:/.test(line)) errors.push(`REPORT_${n}_PUBLISHER_PRICE_LINE_FORMAT_INVALID`);
    }
    if(d>=0){
      const line=block[d].trim();
      if(r.publication_date_display&&!line.includes("◇ 발행일: "+r.publication_date_display)) errors.push(`REPORT_${n}_PUBLICATION_DATE_MISMATCH`);
      if(!/-PDF-.*◆ 공급가격:/.test(line)) errors.push(`REPORT_${n}_PUBLISHED_SUPPLY_LINE_FORMAT_INVALID`);
    }
    if(u>=0){
      const url=block[u].trim().replace(/^자세한 내용의 링크:\s*/,"");
      if(r.url&&url!==r.url) errors.push(`REPORT_${n}_DETAIL_LINK_MISMATCH`);
      if(/[?&](?:utm_[^=]+|fbclid|gclid|mc_cid|mc_eid|_ga|_gl)=|chatgpt\.com|utm_source/i.test(url)) errors.push(`REPORT_${n}_TRACKING_LINK_FORBIDDEN`);
      if(/\.pdf(?:$|[?#])|brochure|\/file\//i.test(url)) errors.push(`REPORT_${n}_BROCHURE_OR_FILE_LINK_FORBIDDEN`);
    }

    const expectedToc=(r.toc_lines||[]).map(x=>String(x).replace(/\s+$/,""));
    if(r.toc_source_verified!==true) errors.push(`REPORT_${n}_TOC_SOURCE_NOT_VERIFIED`);
    if(!expectedToc.length){holds.push(`REPORT_${n}_PUBLIC_TOC_EXPECTED_MISSING`);continue;}
    if(t<0) continue;
    const tocEnd=info>t?info:block.length;
    const actualToc=block.slice(t+1,tocEnd).filter(x=>x.trim()).map(x=>x.replace(/\s+$/,""));
    if(actualToc.length!==expectedToc.length) errors.push(`REPORT_${n}_TOC_INCOMPLETE`);
    if(actualToc.map(x=>x.trim()).join("\n")!==expectedToc.map(x=>x.trim()).join("\n")) errors.push(`REPORT_${n}_TOC_SOURCE_ORDER_NUMBER_OR_TEXT_MISMATCH`);
    if(actualToc.length&&actualToc[actualToc.length-1].trim()!==expectedToc[expectedToc.length-1].trim()) errors.push(`REPORT_${n}_TOC_LAST_ITEM_MISSING_OR_MISMATCH`);
    for(let j=0;j<Math.min(actualToc.length,expectedToc.length);j++){
      const ai=(actualToc[j].match(/^\s*/)||[""])[0].length, ei=(expectedToc[j].match(/^\s*/)||[""])[0].length;
      if(ai!==ei){errors.push(`REPORT_${n}_TOC_INDENTATION_MISMATCH`);break;}
      const en=(expectedToc[j].trim().match(/^(\d+(?:\.\d+)*\.?|Chapter-\s*\d+)/i)||[null,null])[1];
      const an=(actualToc[j].trim().match(/^(\d+(?:\.\d+)*\.?|Chapter-\s*\d+)/i)||[null,null])[1];
      if(en&&en!==an){errors.push(`REPORT_${n}_TOC_NUMBER_NOT_COPYABLE_OR_MISSING`);break;}
    }

    if(info>=0){
      let infoText="";
      for(let j=info+1;j<block.length;j++){ if(block[j].trim()){infoText=block[j].trim();break;} }
      if(!infoText) errors.push(`REPORT_${n}_REPORT_INFO_CONTENT_MISSING`);
      if(r.report_info_ko_exact!==undefined&&infoText!==r.report_info_ko_exact) errors.push(`REPORT_${n}_REPORT_INFO_EXACT_MISMATCH`);
      if(r.report_info_ko_exact===undefined&&infoText&&!/\d/.test(infoText)) errors.push(`REPORT_${n}_REPORT_INFO_NUMERIC_SOURCE_MISSING`);
    }
  }
  if(/\bPASS\b/.test(text)&&(errors.length||holds.length)) errors.push("INVALID_PASS_CLAIM");
  return {status:errors.length?"FAIL":holds.length?"HOLD":"PASS",errors:uniq(errors),holds:uniq(holds)};
}

function runSelfTest(){
  const s="a".repeat(40),e={institution:"기관",name:"고객",email:"a@b.com",prior_send_history_verified:true,evidence:{work_start_rules_sha:s,work_start_checkpoint_sha:s,pre_output_rules_sha:s,pre_output_checkpoint_sha:s},reports:[1,2,3].map(n=>({english_title:`Title ${n}`,korean_title:`제목 ${n}`,publisher:`Publisher ${n}`,pages:"100",price_display:"$ 4,950",publication_date_display:"2026년 08월",url:`https://publisher.example/${n}`,toc_source_verified:true,toc_lines:["1. Overview","  1.1 Scope"],report_info_ko_exact:"시장 규모는 100이다."}))};
  const rep=(n,r)=>[`추천자료 ${n}`,`## 영문 제목: ${r.english_title}`,`## 한글 제목: ${r.korean_title}`,`◇ 발행사: ${r.publisher}                         ( ${r.pages} Pages )        ◇ 정가: ${r.price_display}`,`◇ 발행일: ${r.publication_date_display}                  -PDF-        ◆ 공급가격: 확인 필요`,`자세한 내용의 링크: ${r.url}`,"목차:",...r.toc_lines,"보고서 정보:",r.report_info_ko_exact].join("\n");
  const good=["메일 제목: [해외시장자료 안내] 기관 고객님","이메일 주소: a@b.com",...e.reports.map((r,i)=>rep(i+1,r))].join("\n");
  const ok=validateCustomerGuidanceOutput(good,e); if(ok.status!=="PASS") throw new Error(JSON.stringify(ok));
  const missing3=validateCustomerGuidanceOutput(good.replace("추천자료 3","추천자료 X"),e); if(missing3.status!=="FAIL"||!missing3.errors.includes("ACTUAL_REPORT_COUNT_NOT_THREE")) throw new Error("REPORT_COUNT_GATE_FAILED");
  const tracking=validateCustomerGuidanceOutput(good.replace("https://publisher.example/1","https://publisher.example/1?utm_source=chatgpt.com"),e); if(tracking.status!=="FAIL"||!tracking.errors.includes("REPORT_1_TRACKING_LINK_FORBIDDEN")) throw new Error("TRACKING_GATE_FAILED");
  const noNum=validateCustomerGuidanceOutput(good.replace("  1.1 Scope","  Scope"),e); if(noNum.status!=="FAIL") throw new Error("TOC_NUMBER_GATE_FAILED");
  const inlineInfo=validateCustomerGuidanceOutput(good.replace("보고서 정보:\n시장 규모는 100이다.","보고서 정보: 시장 규모는 100이다."),e); if(inlineInfo.status!=="FAIL"||!inlineInfo.errors.includes("REPORT_1_REPORT_INFO_LABEL_MUST_BE_SEPARATE_LINE")) throw new Error("REPORT_INFO_LAYOUT_GATE_FAILED");
  return {status:"PASS",tests:5};
}

if(typeof module!=="undefined")module.exports={validateCustomerGuidanceOutput};
if(typeof require!=="undefined"&&require.main===module){
  const fs=require("fs"),args=process.argv.slice(2);
  if(args.includes("--self-test")){process.stdout.write(JSON.stringify(runSelfTest(),null,2)+"\n");process.exit(0);}
  const emit=args[0]==="--emit-if-pass",o=emit?args[1]:args[0],e=emit?args[2]:args[1];
  if(!o||!e){process.stderr.write("Usage: node customer_guidance_output_gate.js [--emit-if-pass] <output.txt> <expected.json> | --self-test\n");process.exit(2);}
  const raw=fs.readFileSync(o,"utf8"),r=validateCustomerGuidanceOutput(raw,JSON.parse(fs.readFileSync(e,"utf8")));
  if(emit&&r.status==="PASS") process.stdout.write(raw); else process.stdout.write(JSON.stringify(r,null,2)+"\n");
  process.exit(r.status==="PASS"?0:1);
}
