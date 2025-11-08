import React from 'react'
export const Alert = (p:any)=> <div role="alert" {...p}>{p.children}</div>
export const AlertTitle = (p:any)=> <strong {...p}>{p.children}</strong>
export const AlertDescription = (p:any)=> <div {...p}>{p.children}</div>
export default Alert
