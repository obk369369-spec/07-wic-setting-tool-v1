"use strict";

function branchCustomer(state, candidates) {
  const missing = ["institution","name","current_affiliation_verified","department","position","business_directions","contact_history_verified","current_interests"]
    .filter(k => state[k] === undefined || state[k] === null || state[k] === "" || Array.isArray(state[k]) && !state[k].length);
  if (missing.length || state.current_affiliation_verified !== true) return result("HOLD","VERIFY_CUSTOMER_STATE",missing,"고객 현재 상태를 확인한 뒤 안내 방향을 정합니다.",[],"VERIFY_CUSTOMER_STATE");
  if (state.explicit_stop_or_rejection === true) return result("FAIL","EXPLICIT_STOP_OR_REJECTION",[],"추가 연락을 진행하지 않습니다.",[],"DO_NOT_CONTACT");
  if (state.contact_history_verified !== true) return result("HOLD","PRIOR_CONTACT_HISTORY_UNVERIFIED",["contact_history"],"기존 문의·견적·구매·발송 이력을 확인한 뒤 중복 없이 안내합니다.",[],"VERIFY_HISTORY");

  const type = state.customer_type || (/정책|지원|연구|진흥|공공/.test([state.department,...state.business_directions].join(" ")) ? "RESEARCH_POLICY" : "ENTERPRISE");
  const axes = [...state.business_directions,...state.current_interests].map(x=>String(x).toLowerCase());
  const prior = new Set((state.prior_sent_titles||[]).map(x=>String(x).toLowerCase()));
  const eligible = (candidates||[]).filter(x => x.verified === true && !prior.has(String(x.title).toLowerCase()) && (x.direct_match === true || (x.topics||[]).some(t=>axes.some(a=>a.includes(String(t).toLowerCase())||String(t).toLowerCase().includes(a)))));
  const distinct=[] , publishers=new Set();
  for(const item of eligible){if(!publishers.has(item.publisher)){publishers.add(item.publisher);distinct.push(item);}}
  const required=Number(state.required_recommendation_count||3);
  if(distinct.length<required) return result("HOLD","INSUFFICIENT_VERIFIED_DIRECT_RECOMMENDATIONS",["verified_distinct_publishers"],"확인된 관심 방향과 직접 맞는 자료를 추가 검증한 뒤 안내합니다.",distinct,"VERIFY_RECOMMENDATIONS");
  const followup=(state.prior_inquiry||state.prior_quote||state.prior_purchase) ? "FOLLOW_UP" : "NEW_CONTACT";
  const honorific=state.position ? `${state.name} ${state.position}` : state.name;
  return {
    decision:"PASS",contact:"CONTACT",customer_type:type,contact_mode:followup,
    phone_message:`${honorific}님, 현재 ${state.current_interests.join("·")} 방향과 직접 관련된 신규 해외자료를 중복 없이 확인해 연락드렸습니다.`,
    guidance_message:`${state.institution}의 ${state.business_directions.join("·")} 업무 기준으로 검증된 자료만 안내드립니다.`,
    recommendations:distinct.slice(0,required),next_action:followup==="FOLLOW_UP"?"REFERENCE_PRIOR_INTERACTION_AND_SEND":"SEND_GUIDANCE_AND_RECORD_RESPONSE",reason:"VERIFIED_STATE_HISTORY_INTEREST_MATCH"
  };
}
function result(decision,reason,missing,message,recommendations,next){return {decision,contact:"NO_CONTACT",reason,missing_evidence:missing,phone_message:"",guidance_message:message,recommendations,next_action:next};}
module.exports={branchCustomer};
