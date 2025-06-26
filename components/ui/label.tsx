import * as React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
}

export default function Label({ children, className = '', ...props }: LabelProps) {
  return (
    <label
      className={`font-medium text-sm text-gray-800 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
