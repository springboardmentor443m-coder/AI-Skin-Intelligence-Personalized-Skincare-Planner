import React from 'react';

export const Card = ({
  children,
  className = '',
  glass = false,
  onClick,
  ...props
}) => {
  const baseClasses = 'rounded-2xl p-6 transition-all duration-300';
  const styleClasses = glass 
    ? 'glass-card' 
    : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md';
  
  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${styleClasses} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
export default Card;
