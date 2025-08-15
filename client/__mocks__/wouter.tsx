import React from 'react';

export const Link: React.FC<{ href: string; children?: React.ReactNode } & Record<string, any>> = ({ href, children, ...rest }) => (
  <a href={href} data-mock="wouter-link" {...rest}>
    {children}
  </a>
);

export function useLocation(): readonly [string, (path: string) => void] {
  const setter = () => {};
  return [typeof window !== 'undefined' ? window.location.pathname : '/', setter] as const;
}




