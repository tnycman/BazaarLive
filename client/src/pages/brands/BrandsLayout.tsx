import { ReactNode } from 'react';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';

interface BrandsLayoutProps {
  readonly title?: string;
  readonly subtitle?: string;
  readonly children: ReactNode;
}

export default function BrandsLayout({ title = 'Brands', subtitle, children }: BrandsLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation />
      <main id="top" className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {children}
      </main>
    </div>
  );
}


