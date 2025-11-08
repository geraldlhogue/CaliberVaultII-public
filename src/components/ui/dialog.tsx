import React from 'react'
export const Dialog = (p:any)=> <div {...p}>{p.children}</div>
export const DialogContent = (p:any)=> <div {...p}>{p.children}</div>
export const DialogHeader = (p:any)=> <div {...p}>{p.children}</div>
export const DialogTitle = (p:any)=> <h2 {...p}>{p.children}</h2>
export const DialogDescription = (p:any)=> <p {...p}>{p.children}</p>
export const DialogFooter = (p:any)=> <div {...p}>{p.children}</div>
export const DialogTrigger = (p:any)=> <button {...p}>{p.children}</button>
export default Dialog
