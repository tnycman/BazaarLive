import { slugify } from '@/services/routing/RouteUtils';

export interface BrandRecord {
  readonly id: string; // slug id
  readonly name: string; // display name
}

export type AlphabetKey = '0-9' | 'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L'|'M'|'N'|'O'|'P'|'Q'|'R'|'S'|'T'|'U'|'V'|'W'|'X'|'Y'|'Z';

const SAMPLE_BRANDS: readonly string[] = [
  // Numbers
  '10 Deep','1017 ALYX 9SM','3.1 Phillip Lim','47',
  // A
  'A Bathing Ape','ACNE Studios','adidas','Akris','AllSaints','Anne Klein','ASOS','Athleta',
  // B
  'Balenciaga','Balmain','Banana Republic','Barbour','Bottega Veneta','Burberry','BOSS',
  // C
  'Calvin Klein','Canada Goose','Carhartt','Cartier','Chanel','Chloe','Cole Haan','Converse','Coach',
  // D
  'Dior','Diesel','Doc Martens','Dolce & Gabbana','Dr. Martens',
  // E
  'Eileen Fisher','Everlane','Etro',
  // F
  'Fendi','Fjallraven','Fossil','Free People',
  // G
  'Gap','GAP Kids','Giorgio Armani','Givenchy','Gucci','Guess',
  // H
  'H&M','Hoka','Hollister','Hermes','Hurley',
  // I
  'IKEA','Isabel Marant',
  // J
  'J. Crew','J Brand','Jacquemus','Jordan','Jimmy Choo',
  // K
  'Kate Spade','Kenzo','Kith','Keen',
  // L
  'L.L.Bean','Lacoste','Levi\'s','Louis Vuitton','Lululemon',
  // M
  'Madewell','Maje','Mango','Marc Jacobs','Michael Kors','Moncler','Morgan',
  // N
  'New Balance','Nike','Nine West','Nixon','North Face','Norma Kamali',
  // O
  'Oakley','Off-White','On Running','Old Navy',
  // P
  'Patagonia','Prada','Polo Ralph Lauren','Prada Sport','Puma',
  // Q
  'Quiksilver',
  // R
  'Rag & Bone','Ray-Ban','Reebok','Rick Owens','Rolex',
  // S
  'Saint Laurent','Salomon','Salvatore Ferragamo','Sam Edelman','Sandro','SEIKO','SHEIN','SKIMS','Steve Madden','Stussy','Supreme',
  // T
  'Talbots','Ted Baker','The Kooples','The Row','Theory','Timberland','Tom Ford','Tommy Hilfiger','Tory Burch',
  // U
  'UGG','Under Armour','Uniqlo',
  // V
  'Valentino','Vans','Versace','Vince','Vineyard Vines',
  // W
  'Warby Parker','Weekday','Wrangler',
  // X
  'Xhilaration',
  // Y
  'Yeezy','Yves Saint Laurent',
  // Z
  'Zadig & Voltaire','Zara','Zegna'
];

const ALL_BRANDS: readonly BrandRecord[] = SAMPLE_BRANDS.map((name) => ({ id: slugify(name), name }));

export function getAlphabetKeys(): AlphabetKey[] {
  return ['0-9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
}

export function groupBrandsByAlphabet(): ReadonlyMap<AlphabetKey, BrandRecord[]> {
  const map = new Map<AlphabetKey, BrandRecord[]>();
  getAlphabetKeys().forEach((k) => map.set(k, []));
  for (const brand of ALL_BRANDS) {
    const first = brand.name.charAt(0).toUpperCase();
    const key: AlphabetKey = /[0-9]/.test(first) ? '0-9' : (first as AlphabetKey);
    const arr = map.get(key)!;
    arr.push(brand);
  }
  // sort within each bucket by display name
  for (const [, arr] of map) {
    arr.sort((a, b) => a.name.localeCompare(b.name));
  }
  return map;
}

export function getBrandsByAlphabet(letter: AlphabetKey): BrandRecord[] {
  const grouped = groupBrandsByAlphabet();
  return grouped.get(letter) ?? [];
}

export function getBrandBySlug(slug: string): BrandRecord | undefined {
  const target = slug.toLowerCase();
  return ALL_BRANDS.find((b) => b.id === target);
}


