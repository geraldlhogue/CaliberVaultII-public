import React from 'react';
export const Progress: React.FC<{ value?: number } & React.HTMLAttributes<HTMLDivElement>> = ({value=0, ...p}) => <div role="progressbar" aria-valuenow={value} {...p} />;
export default Progress;
