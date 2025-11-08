export function useSubscription(){
  function hasFeature(name){ return name !== 'nonexistent_feature' }
  return { hasFeature, tier:'pro', status:'active', limits:{ maxItems:1000 } }
}
export default useSubscription
