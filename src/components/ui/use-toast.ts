export const toast = Object.assign(
  function (_opts: { title?: string; description?: string }) { /* noop */ },
  { success: function (_:any){}, error: function (_:any){} }
);
export default { toast };
