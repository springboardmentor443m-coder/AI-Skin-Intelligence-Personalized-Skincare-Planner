import React from 'react';

export const Input = React.forwardRef(({
  label,
  type = 'text',
  error,
  placeholder,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full mb-4">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <input
        type={type}
        ref={ref}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-900 dark:text-slate-100 ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500 font-medium">
          {error.message || error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
