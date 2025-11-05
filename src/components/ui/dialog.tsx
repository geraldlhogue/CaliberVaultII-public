import React from 'react';
export const Dialog: React.FC<React.HTMLAttributes<HTMLDivElement>> = (p)=> <div role="dialog" {...p} />;
export const DialogContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = (p)=> <div {...p} />;
export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = (p)=> <div {...p} />;
export const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = (p)=> <h2 {...p} />;
export const DialogDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = (p)=> <p {...p} />;
export default Dialog;
