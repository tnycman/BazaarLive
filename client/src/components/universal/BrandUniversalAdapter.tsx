import { useRoute } from 'wouter';
import UniversalCategoryPage from '@/components/universal/UniversalCategoryPage';
import { getBrandBySlug } from '@/services/brands/BrandRegistry';
import { useEffect, useState } from 'react';

export default function BrandUniversalAdapter() {
  const [, params] = useRoute('/fashion/brands/:brand');
  const brandSlug = (params?.brand || '').toLowerCase();
  const localBrand = getBrandBySlug(brandSlug);
  const [brand, setBrand] = useState(localBrand ?? null);

  useEffect(() => {
    let cancelled = false;
    // Fetch metadata from server to get logo/description
    fetch(`/api/brands/${brandSlug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!cancelled && data) setBrand({ id: data.id, name: data.name });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [brandSlug]);

  if (!brand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Brand Not Found</h1>
          <p className="text-sm text-muted-foreground">The brand you requested does not exist.</p>
        </div>
      </div>
    );
  }

  // Render the universal template with fashion category and brand facet applied
  return (
    <UniversalCategoryPage
      category="fashion"
      initialFilterState={{ selectedBrands: [brand.id] }}
      pageTitleOverride={brand.name}
    />
  );
}


