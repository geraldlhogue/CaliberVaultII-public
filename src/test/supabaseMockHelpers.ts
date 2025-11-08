export function makeWriteChain(record){
  return {
    data: record,
    error: null,
    select(){
      return {
        single(){ return { data: record, error: null } },
        limit(){ return { data: [record], error: null } }
      }
    },
    single(){ return { data: record, error: null } }
  }
}
