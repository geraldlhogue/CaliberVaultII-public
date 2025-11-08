import React from 'react'
export const Card = (p:any)=> <div {...p}>{p.children}</div>
export const CardHeader = (p:any)=> <div {...p}>{p.children}</div>
export const CardTitle = (p:any)=> <h3 {...p}>{p.children}</h3>
export const CardDescription = (p:any)=> <p {...p}>{p.children}</p>
export const CardContent = (p:any)=> <div {...p}>{p.children}</div>
export const CardFooter = (p:any)=> <div {...p}>{p.children}</div>
export default Card
