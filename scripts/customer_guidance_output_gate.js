"use strict";
const uniq=a=>[...new Set(a)], shaOk=v=>/^[0-9a-f]{40}$/i.test(String(v||""));
function validateCustomerGuidanceOutput(output,expected){
 const errors=[],holds=[],text=String(output||"").replace(/\r\n/g,"\n"),lines=text.split("\n"),nonempty=lines.filter(x=>x.trim());
 const ev=expected.evidence||{}; if(!shaOk(ev.work_start_rules_sha)||!shaOk(ev.work_start_checkpoint_sha)||!shaOk(ev.pre_output_rules_sha)||!shaOk(ev.pre_output_checkpoint_sha)) errors.push("READBACK_EVIDENCE_MISSING");
 const f=expected.feedback_evidence||{}; if(expected.feedback_evidence&&(!shaOk(f.master_commit_sha)||!shaOk(f.checkpoint_commit_sha)||f.remote_readback_match!==true)) errors.push("FEEDBACK_EVIDENCE_INVALID");
 if(expected.prior_send_history_verified!==true) holds.push("PRIOR_SEND_HISTORY_UNVERIFIED");
 const reports=Array.isArray(expected.reports)?expected.reports:[]; if(reports.length!==3) errors.push("EXPECTED_REPORT_COUNT_NOT_THREE");
 reports.forEach((r,i)=>{const n=i+1;if(r.toc_source_verified!==true)holds.push(`REPORT_${n}_TOC_SOURCE_NOT_VERIFIED`);if(!r.english_title||!r.publisher||!r.url)holds.push(`REPORT_${n}_CORE_FIELD_MISSING`);});
 if(expected.mode==="preflight")return{status:errors.length?"FAIL":holds.length?"HOLD":"PASS",errors:uniq(errors),holds:uniq(holds)};
 const subject=`메일 제목: [해외시장자료 안내] ${expected.institution} ${expected.name}님`,email=`이메일 주소: ${expected.email}`; if(nonempty[0]!==subject)errors.push("MAIL_SUBJECT_MISMATCH");if(nonempty[1]!==email)errors.push("EMAIL_MISMATCH");
 const starts=[1,2,3].map(n=>lines.findIndex(x=>x.trim()===`추천자료 ${n}`)); if(starts.some(x=>x<0)||lines.filter(x=>/^추천자료\s+\d+\s*$/.test(x.trim())).length!==3)errors.push("ACTUAL_REPORT_COUNT_NOT_THREE");
 for(let i=0;i<reports.length;i++){
  const n=i+1,r=reports[i],start=starts[i],next=i<2&&starts[i+1]>=0?starts[i+1]:lines.length;if(start<0)continue;const block=lines.slice(start,next),find=rx=>block.findIndex(x=>rx.test(x.trim()));
  const e=find(/^##\s+영문 제목:/),k=find(/^##\s+한글 제목(?:\(참고 번역\))?:/),p=find(/^◇ 발행사:/),d=find(/^◇ 발행일:/),u=find(/^자세한 내용의 링크:/),t=find(/^목차:$/),info=find(/^보고서 정보:\s*$/);if([e,k,p,d,u,t,info].some(x=>x<0))errors.push(`REPORT_${n}_FIELD_MISSING`);
  if(e>=0&&block[e].trim().replace(/^##\s+영문 제목:\s*/,"")!==r.english_title)errors.push(`REPORT_${n}_ENGLISH_TITLE_MISMATCH`);if(k>=0&&block[k].trim().replace(/^##\s+한글 제목(?:\(참고 번역\))?:\s*/,"")!==r.korean_title)errors.push(`REPORT_${n}_KOREAN_TITLE_MISMATCH`);
  if(p>=0){const v=block[p].trim();if(!v.includes(`◇ 발행사: ${r.publisher}`))errors.push(`REPORT_${n}_PUBLISHER_MISMATCH`);if(r.pages&&!v.includes(`( ${r.pages} Pages )`))errors.push(`REPORT_${n}_PAGES_MISMATCH`);if(r.price_display&&!v.includes(`◇ 정가: ${r.price_display}`))errors.push(`REPORT_${n}_PRICE_MISMATCH`);}
  if(d>=0){const v=block[d].trim();if(r.publication_date_display&&!v.includes(`◇ 발행일: ${r.publication_date_display}`))errors.push(`REPORT_${n}_DATE_MISMATCH`);if(!/-PDF-.*◆ 공급가격:/.test(v))errors.push(`REPORT_${n}_LINE2_FORMAT_INVALID`);}
  if(u>=0){const url=block[u].trim().replace(/^자세한 내용의 링크:\s*/,"");if(url!==r.url)errors.push(`REPORT_${n}_URL_MISMATCH`);if(/[?&](?:utm_[^=]+|fbclid|gclid|_ga|_gl)=|chatgpt\.com/i.test(url))errors.push(`REPORT_${n}_TRACKING_LINK_FORBIDDEN`);}
  if(t>=0&&info>t){const toc=block.slice(t+1,info).filter(x=>x.trim()).map(x=>x.replace(/\s+$/, "")),req=(r.toc_lines||[]).map(String);if(r.toc_min_lines&&toc.length<r.toc_min_lines)errors.push(`REPORT_${n}_TOC_INCOMPLETE`);if(r.toc_match_mode==="required"){for(const x of req)if(!toc.includes(x))errors.push(`REPORT_${n}_REQUIRED_TOC_LINE_MISSING`);if(req.length&&toc.at(-1)!==req.at(-1))errors.push(`REPORT_${n}_TOC_LAST_ITEM_MISSING_OR_MISMATCH`);}else if(req.length&&toc.join("\n")!==req.join("\n"))errors.push(`REPORT_${n}_TOC_SOURCE_ORDER_NUMBER_OR_TEXT_MISMATCH`);if(toc.some(x=>/^\s+\d+(?:\.\d+)+\s/.test(x)&&!/^\s+\d+(?:\.\d+)+\s/.test(x)))errors.push(`REPORT_${n}_TOC_NUMBER_NOT_COPYABLE_OR_MISSING`);}
  if(info>=0){const body=(block[info+1]||"").trim();if(!body)errors.push(`REPORT_${n}_REPORT_INFO_BODY_MISSING`);if(r.report_info_ko_exact!==undefined&&body!==r.report_info_ko_exact)errors.push(`REPORT_${n}_REPORT_INFO_EXACT_MISMATCH`);}
 }
 if(/\bPASS\b/.test(text)&&(errors.length||holds.length))errors.push("INVALID_PASS_CLAIM");return{status:errors.length?"FAIL":holds.length?"HOLD":"PASS",errors:uniq(errors),holds:uniq(holds)};
}
if(typeof module!=="undefined")module.exports={validateCustomerGuidanceOutput};
if(typeof require!=="undefined"&&require.main===module){const fs=require("fs"),a=process.argv.slice(2),emit=a[0]==="--emit-if-pass",o=emit?a[1]:a[0],e=emit?a[2]:a[1];if(!o||!e){process.exit(2)}const raw=fs.readFileSync(o,"utf8"),r=validateCustomerGuidanceOutput(raw,JSON.parse(fs.readFileSync(e,"utf8")));if(emit&&r.status==="PASS")process.stdout.write(raw);else process.stdout.write(JSON.stringify(r,null,2)+"\n");process.exit(r.status==="PASS"?0:1);}
