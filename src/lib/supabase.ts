type SelectResult<T=any> = { data: T[] | null; error: any | null };
const chain = () => ({
  select: () => ({ data: [], error: null } as SelectResult),
  insert: () => ({ select: () => ({ data: [], error: null } as SelectResult) }),
  update: () => ({ select: () => ({ data: [], error: null } as SelectResult) }),
  delete: () => ({ select: () => ({ data: [], error: null } as SelectResult) }),
  eq: () => chain(),
  limit: () => ({ data: [], error: null } as SelectResult),
  single: () => ({ data: null, error: null }),
});
export const supabase = {
  from: () => chain(),
  auth: {
    getSession: async () => ({ data: { session: { user: { id: 'test-user' } } }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe(){} } }, error: null }),
  },
};
export default supabase;
