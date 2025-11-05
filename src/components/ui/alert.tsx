import React from 'react';
export const Alert: React.FC<React.HTMLAttributes<HTMLDivElement>> = (p)=> <div role="alert" {...p} />;
export const AlertDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = (p)=> <p {...p} />;
export default Alert;
