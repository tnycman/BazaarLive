import { useRoute } from 'wouter';
import BrandsLayout from './BrandsLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function BrandDetailPage() {
  const [, params] = useRoute('/fashion/brands/:brand');
  const brand = (params?.brand || '').replace(/-/g, ' ');

  return (
    <BrandsLayout title={brand} subtitle="Explore listings and collections for this brand">
      <section className="mb-8">
        <div className="flex items-center gap-3">
          <Input placeholder="Search within this brand..." className="max-w-md" />
          <Button variant="outline">Filter</Button>
        </div>
      </section>
      <section>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square rounded border p-4 text-sm text-muted-foreground">
              Placeholder product {i + 1}
            </div>
          ))}
        </div>
      </section>
    </BrandsLayout>
  );
}


