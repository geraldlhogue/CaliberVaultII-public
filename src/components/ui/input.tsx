import React from 'react';
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((p,ref)=><input ref={ref} {...p} />);
Input.displayName='Input';
export default Input;
