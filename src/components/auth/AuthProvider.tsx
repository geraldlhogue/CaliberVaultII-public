import React, { createContext, useContext } from 'react'
type Ctx = { user?: { id:string } | null, signIn: ()=>void, signOut: ()=>void }
const AuthCtx = createContext<Ctx>({ user: null, signIn: ()=>{}, signOut: ()=>{} })
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthCtx.Provider value={{ user: null, signIn(){}, signOut(){} }}>{children}</AuthCtx.Provider>
}
export function useAuth(){ return useContext(AuthCtx) }
export default AuthProvider
