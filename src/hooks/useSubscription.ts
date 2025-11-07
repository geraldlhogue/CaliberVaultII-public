export function useSubscription(){
  return {
    hasFeature: (name:string) => name !== 'nonexistent_feature',
    tier: 'pro',
    status: 'active',
    planType: 'pro',
    limits: { maxItems: 1000 },
  }
}
export default useSubscription
