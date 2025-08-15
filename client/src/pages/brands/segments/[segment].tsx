import { useRoute } from 'wouter';
import BrandsLayout from '../BrandsLayout';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { navigationService } from '@/services/routing/NavigationService';

export default function BrandSegmentPage() {
  const [, params] = useRoute('/fashion/brands/segments/:segment');
  const segment = (params?.segment || '').toLowerCase();

  const featured = {
    women: ['Coach', 'Kate Spade', 'Michael Kors', 'Chanel'],
    men: ['Nike', 'Gucci', 'The North Face', 'Levi\'s'],
    kids: ['Gap', 'Carter\'s', 'Old Navy', 'Converse'],
    home: ['IKEA', 'Crate & Barrel', 'West Elm', 'Target'],
    electronics: ['Apple', 'Sony', 'Samsung', 'Canon']
  } as const;

  const list = (featured as any)[segment] as string[] | undefined;

  return (
    <BrandsLayout title={`Brands — ${segment.charAt(0).toUpperCase() + segment.slice(1)}`}>
      {list ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {list.map((brand) => (
            <Link key={brand} href={navigationService.generateBrandRoute(brand)}>
              <Button variant="ghost" className="justify-start">
                {brand}
              </Button>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Unknown brand segment.</p>
      )}
    </BrandsLayout>
  );
}


