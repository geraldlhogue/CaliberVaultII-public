import React from 'react';
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>((p,ref)=><textarea ref={ref} {...p}/>);
Textarea.displayName='Textarea';
export default Textarea;
