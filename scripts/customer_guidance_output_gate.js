"use strict";
const crypto=require("crypto");
const uniq=a=>[...new Set(a)];
const shaOk=v=>/^[0-9a-f]{40}$/i.test(String(v||""));
const hash=s=>crypto.createHash("sha256").update(String(s).replace(/\r\n/g,"\n"),"utf8").digest("hex");

function validateCustomerGuidanceOutput(output,expected){
 const errors=[],holds=[],checks=[];
 const add=(id,status,detail="")=>checks.push({id,status,detail});
 const fail=(id,detail="")=>{errors.push(id);add(id,"FAIL",detail)};
 const hold=(id,detail="")=>{holds.push(id);add(id,"HOLD",detail)};
 const pass=(id,detail="")=>add(id,"PASS",detail);
 const text=String(output||"").replace(/\r\n/g,"\n"),lines=text.split("\n"),nonempty=lines.filter(x=>x.trim());
 const ev=expected.evidence||{};
 if(!shaOk(ev.work_start_rules_sha)||!shaOk(ev.work_start_checkpoint_sha)||!shaOk(ev.pre_output_rules_sha)||!shaOk(ev.pre_output_checkpoint_sha)) fail("READBACK_EVIDENCE","master/checkpoint SHA missing"); else pass("READBACK_EVIDENCE");
 const f=expected.feedback_evidence||{};
 if(expected.feedback_evidence&&(!shaOk(f.master_commit_sha)||!shaOk(f.checkpoint_commit_sha)||f.remote_readback_match!==true)) fail("FEEDBACK_EVIDENCE","feedback evidence invalid"); else pass("FEEDBACK_EVIDENCE");
 if(expected.prior_send_history_verified!==true) hold("PRIOR_SEND_HISTORY","unverified"); else pass("PRIOR_SEND_HISTORY");
 const reports=Array.isArray(expected.reports)?expected.reports:[];
 if(reports.length!==3) fail("REPORT_COUNT","expected reports not exactly 3"); else pass("REPORT_COUNT","3/3");
 reports.forEach((r,i)=>{const n=i+1;if(r.toc_source_verified!==true)hold(`R${n}_TOC_SOURCE`,`not verified`);else pass(`R${n}_TOC_SOURCE`);if(!r.english_title||!r.publisher||!r.url)hold(`R${n}_CORE_FIELDS`,`missing core field`);else pass(`R${n}_CORE_FIELDS`);if(!Array.isArray(r.toc_lines)||!r.toc_lines.length)hold(`R${n}_FULL_TOC_EXPECTED`,`full toc_lines missing`);else pass(`R${n}_FULL_TOC_EXPECTED`,`${r.toc_lines.length} lines`);});
 if(expected.mode==="preflight")return{status:errors.length?"FAIL":holds.length?"HOLD":"PASS",errors:uniq(errors),holds:uniq(holds),checks};
 const subject=`메일 제목: [해외시장자료 안내] ${expected.institution} ${expected.name}님`,email=`이메일 주소: ${expected.email}`;
 if(nonempty[0]!==subject)fail("MAIL_SUBJECT","mismatch");else pass("MAIL_SUBJECT");
 if(nonempty[1]!==email)fail("EMAIL","mismatch");else pass("EMAIL");
 const starts=[1,2,3].map(n=>lines.findIndex(x=>x.trim()===`추천자료 ${n}`)),headers=lines.filter(x=>/^추천자료\s+\d+\s*$/.test(x.trim()));
 if(starts.some(x=>x<0)||headers.length!==3||!(starts[0]<starts[1]&&starts[1]<starts[2]))fail("ACTUAL_REPORT_COUNT","not exactly 3 ordered blocks");else pass("ACTUAL_REPORT_COUNT","3/3");
 for(let i=0;i<reports.length;i++){
  const n=i+1,r=reports[i],start=starts[i],next=i<2&&starts[i+1]>=0?starts[i+1]:lines.length;if(start<0)continue;
  const block=lines.slice(start,next),find=rx=>block.findIndex(x=>rx.test(x.trim()));
  const e=find(/^##\s+영문 제목:/),k=find(/^##\s+한글 제목(?:\(참고 번역\))?:/),p=find(/^◇ 발행사:/),d=find(/^◇ 발행일:/),u=find(/^자세한 내용의 링크:/),t=find(/^목차:$/),info=find(/^보고서 정보:\s*$/);
  if([e,k,p,d,u,t,info].some(x=>x<0))fail(`R${n}_FIELD_ORDER_OR_MISSING`);else if(!(e<k&&k<p&&p<d&&d<u&&u<t&&t<info))fail(`R${n}_FIELD_ORDER_OR_MISSING`,`wrong order`);else pass(`R${n}_FIELD_ORDER_OR_MISSING`);
  if(e>=0&&block[e].trim().replace(/^##\s+영문 제목:\s*/,"")!==r.english_title)fail(`R${n}_OFFICIAL_ENGLISH_TITLE`);else pass(`R${n}_OFFICIAL_ENGLISH_TITLE`);
  if(k>=0&&block[k].trim().replace(/^##\s+한글 제목(?:\(참고 번역\))?:\s*/,"")!==r.korean_title)fail(`R${n}_FULL_KOREAN_TITLE`);else pass(`R${n}_FULL_KOREAN_TITLE`);
  if(p>=0){const v=block[p].trim();if(!v.includes(`◇ 발행사: ${r.publisher}`))fail(`R${n}_PUBLISHER`);else pass(`R${n}_PUBLISHER`);if(r.pages&&!v.includes(`( ${r.pages} Pages )`))fail(`R${n}_PAGES`);else pass(`R${n}_PAGES`);if(r.price_display&&!v.includes(`◇ 정가: ${r.price_display}`))fail(`R${n}_PRICE`);else pass(`R${n}_PRICE`);if(!/^◇ 발행사:.*\(\s*[^)]*Pages\s*\).*◇ 정가:/.test(v))fail(`R${n}_BOOK_INFO_LINE1`);else pass(`R${n}_BOOK_INFO_LINE1`);}
  if(d>=0){const v=block[d].trim();if(r.publication_date_display&&!v.includes(`◇ 발행일: ${r.publication_date_display}`))fail(`R${n}_PUBLICATION_DATE`);else pass(`R${n}_PUBLICATION_DATE`);if(!/-PDF-.*◆ 공급가격:/.test(v))fail(`R${n}_BOOK_INFO_LINE2`);else pass(`R${n}_BOOK_INFO_LINE2`);}
  if(u>=0){const url=block[u].trim().replace(/^자세한 내용의 링크:\s*/,"");if(url!==r.url)fail(`R${n}_URL_EXACT`);else pass(`R${n}_URL_EXACT`);if(/[?&](?:utm_[^=]+|fbclid|gclid|mc_cid|mc_eid|_ga|_gl)=|chatgpt\.com/i.test(url))fail(`R${n}_TRACKING_URL`);else pass(`R${n}_TRACKING_URL`,`stored/output URL clean`);}
  if(t>=0&&info>t){
   const toc=block.slice(t+1,info).filter(x=>x.trim()).map(x=>x.replace(/\s+$/, ""));
   const exp=(r.toc_lines||[]).map(x=>String(x).replace(/\s+$/, ""));
   if(toc.length!==exp.length)fail(`R${n}_TOC_FULL_LENGTH`,`${toc.length}/${exp.length}`);else pass(`R${n}_TOC_FULL_LENGTH`,`${toc.length}/${exp.length}`);
   if(toc.join("\n")!==exp.join("\n"))fail(`R${n}_TOC_EXACT_ALL_LINES`);else pass(`R${n}_TOC_EXACT_ALL_LINES`);
   if(exp.length&&toc.at(-1)!==exp.at(-1))fail(`R${n}_TOC_LAST_ITEM`);else pass(`R${n}_TOC_LAST_ITEM`,exp.at(-1)||"");
   let numberingOK=true,indentOK=true;
   for(let j=0;j<Math.min(toc.length,exp.length);j++){
    const expNum=(exp[j].trim().match(/^(\d+(?:\.\d+)*\.?|Chapter-\s*\d+)/i)||[,""])[1];
    const actNum=(toc[j].trim().match(/^(\d+(?:\.\d+)*\.?|Chapter-\s*\d+)/i)||[,""])[1];
    if(expNum&&actNum!==expNum)numberingOK=false;
    if((toc[j].match(/^\s*/)||[""])[0].length!==(exp[j].match(/^\s*/)||[""])[0].length)indentOK=false;
   }
   if(!numberingOK)fail(`R${n}_TOC_NUMBER_COPYABLE`);else pass(`R${n}_TOC_NUMBER_COPYABLE`);
   if(!indentOK)fail(`R${n}_TOC_INDENTATION`);else pass(`R${n}_TOC_INDENTATION`);
   const subExp=exp.filter(x=>/^\s+\S/.test(x));const subAct=toc.filter(x=>/^\s+\S/.test(x));
   if(subAct.length!==subExp.length)fail(`R${n}_TOC_SUBHEADINGS_ALL_PRESENT`,`${subAct.length}/${subExp.length}`);else pass(`R${n}_TOC_SUBHEADINGS_ALL_PRESENT`,`${subAct.length}/${subExp.length}`);
  }
  if(info>=0){const body=(block[info+1]||"").trim();if(block[info].trim()!=="보고서 정보:")fail(`R${n}_REPORT_INFO_LABEL_SEPARATE`);else pass(`R${n}_REPORT_INFO_LABEL_SEPARATE`);if(!body)fail(`R${n}_REPORT_INFO_BODY`);else if(r.report_info_ko_exact!==undefined&&body!==r.report_info_ko_exact)fail(`R${n}_REPORT_INFO_EXACT`);else{pass(`R${n}_REPORT_INFO_BODY`);pass(`R${n}_REPORT_INFO_EXACT`);}}
 }
 if(expected.user_visible_output_sha256){if(hash(text)!==expected.user_visible_output_sha256)fail("USER_VISIBLE_OUTPUT_EXACT","final user-visible body differs from validated fixture");else pass("USER_VISIBLE_OUTPUT_EXACT");}
 return{status:errors.length?"FAIL":holds.length?"HOLD":"PASS",errors:uniq(errors),holds:uniq(holds),checks,output_sha256:hash(text)};
}
if(typeof module!=="undefined")module.exports={validateCustomerGuidanceOutput};
if(typeof require!=="undefined"&&require.main===module){const fs=require("fs"),a=process.argv.slice(2),emit=a[0]==="--emit-if-pass",o=emit?a[1]:a[0],e=emit?a[2]:a[1];if(!o||!e)process.exit(2);const raw=fs.readFileSync(o,"utf8"),r=validateCustomerGuidanceOutput(raw,JSON.parse(fs.readFileSync(e,"utf8")));if(emit&&r.status==="PASS")process.stdout.write(raw);else process.stdout.write(JSON.stringify(r,null,2)+"\n");process.exit(r.status==="PASS"?0:1);}
