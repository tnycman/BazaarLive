import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMemo, useState } from 'react';
import BrandsLayout from './BrandsLayout';
import { getAlphabetKeys, getBrandsByAlphabet, type AlphabetKey } from '@/services/brands/BrandRegistry';

export default function BrandsIndex() {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();

  const letters = useMemo(() => getAlphabetKeys(), []);

  const getFilteredBrands = (letter: AlphabetKey) => {
    const list = getBrandsByAlphabet(letter);
    if (!normalizedQuery) return list;
    return list.filter((b) => b.name.toLowerCase().includes(normalizedQuery));
  };

  return (
    <BrandsLayout subtitle="Browse all brands alphabetically">
      {/* Search */}
      <div className="mb-4 flex items-center gap-3">
        <label htmlFor="brand-search" className="sr-only">Search brands</label>
        <Input
          id="brand-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search brands..."
          className="max-w-sm"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setQuery('');
          }}
        />
        {query && (
          <Button variant="ghost" onClick={() => setQuery('')} className="text-sm">
            Clear
          </Button>
        )}
        <div aria-live="polite" className="text-sm text-muted-foreground ml-auto">
          {normalizedQuery ? 'Filtering results' : 'Showing all brands'}
        </div>
      </div>
      {/* Alphabet index */}
      <div className="sticky top-16 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b mb-6">
        <div className="flex flex-wrap gap-3 py-3">
        {letters.map((letter) => (
          <a key={letter} href={`#alpha-${letter}`} className="text-sm text-purple-700 hover:underline">
            {letter}
          </a>
        ))}
          <a href="#top" className="ml-auto text-sm text-muted-foreground hover:underline">Back to top</a>
        </div>
      </div>

      {/* Alphabet sections */}
      {letters.map((letter) => (
        <section key={letter} id={`alpha-${letter}`} className="mb-10 scroll-mt-28">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">{letter}</h2>
          <div className="columns-1 md:columns-3 xl:columns-5 gap-6">
            {getFilteredBrands(letter as AlphabetKey).map((brand) => (
              <div key={brand.id} className="break-inside-avoid mb-1">
                <Link href={`/fashion/brands/${brand.id}`}>
                  <Button variant="link" className="p-0 h-auto text-purple-700 hover:text-purple-800">
                    {brand.name}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </section>
      ))}
    </BrandsLayout>
  );
}


