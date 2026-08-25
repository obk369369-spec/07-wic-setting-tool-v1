"use strict";
const fs=require("fs"),path=require("path"),assert=require("assert");
const {branchCustomer}=require("./customer_branch_engine");
const f=JSON.parse(fs.readFileSync(path.join(__dirname,"../fixtures/customer_branch_actual_kmg.json"),"utf8"));
for(const c of f.actual_pairs){const r=branchCustomer({...f.base_state,...c.override},f.candidates);for(const [k,v] of Object.entries(c.expected)){if(k==="recommendation_count")assert.equal(r.recommendations.length,v,c.id);else assert.deepEqual(r[k],v,c.id+":"+k);}console.log("PASS",c.id);}
let r=branchCustomer({...f.base_state,current_affiliation_verified:false},f.candidates);assert.equal(r.decision,"HOLD");assert.equal(r.next_action,"VERIFY_CUSTOMER_STATE");console.log("PASS SYNTHETIC-UNVERIFIED-STATE");
r=branchCustomer({...f.base_state,explicit_stop_or_rejection:true},f.candidates);assert.equal(r.decision,"FAIL");assert.equal(r.next_action,"DO_NOT_CONTACT");console.log("PASS SYNTHETIC-EXPLICIT-STOP");
r=branchCustomer({...f.base_state,required_recommendation_count:4},f.candidates);assert.equal(r.decision,"HOLD");assert.equal(r.next_action,"VERIFY_RECOMMENDATIONS");console.log("PASS SYNTHETIC-INSUFFICIENT-DIRECT-MATERIALS");
console.log("PASS: T42 actual branch pairs 2/2 + protective branches 3/3");
