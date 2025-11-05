import React from 'react';
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = (p)=> <div {...p} />;
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = (p)=> <div {...p} />;
export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = (p)=> <h3 {...p} />;
export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = (p)=> <p {...p} />;
export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = (p)=> <div {...p} />;
export default Card;
