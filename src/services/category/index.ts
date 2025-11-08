export const firearmsService = { create: async (a:any)=>{ return { success: true, data: { id: 'f1', ...a } } }, update: async()=>({ success: true }), delete: async()=>({ success: true })}
export const ammunitionService = { create: async (a:any)=>{ return { success: true, data: { id: 'a1', ...a } } }, update: async()=>({ success: true }), delete: async()=>({ success: true })}
export const opticsService = { create: async (a:any)=>{ return { success: true, data: { id: 'o1', ...a } } }, update: async()=>({ success: true }), delete: async()=>({ success: true })}
export const magazinesService = { create: async (a:any)=>{ return { success: true, data: { id: 'm1', ...a } } }, update: async()=>({ success: true }), delete: async()=>({ success: true })}
export default { firearmsService, ammunitionService, opticsService, magazinesService }
