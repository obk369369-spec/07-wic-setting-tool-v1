'use strict';
// Supported output entries all route through canonical startup and release.
const start=request=>require('./customer_work_start').startCustomerWork(request);
module.exports={
  branchCustomer:state=>start(state),
  prepareContactCopy:state=>start(state),
  validateContactCopy:copy=>require('./_customer_branch_internal').validateContactCopy(copy)
};
if(require.main===module){
  start(JSON.parse(require('fs').readFileSync(0,'utf8'))).then(result=>{
    process.stdout.write(JSON.stringify(result)+'\n');process.exitCode=result.output_allowed===true?0:2;
  });
}
