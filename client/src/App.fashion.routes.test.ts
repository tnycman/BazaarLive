import fs from 'fs';
import path from 'path';

// This test enforces a single source of truth for /fashion routes
// - Only client/src/App.tsx may define /fashion routes
// - All /fashion routes must render UniversalCategoryPage

describe('Fashion routing single-source-of-truth', () => {
  const repoRoot = path.resolve(__dirname, '..');
  const appFile = path.resolve(repoRoot, 'src', 'App.tsx');

  test('App.tsx defines all /fashion routes and uses UniversalCategoryPage', () => {
    const appSource = fs.readFileSync(appFile, 'utf8');

    // Ensure /fashion root redirect exists
    expect(appSource).toMatch(/<Route\s+path="\/fashion"\s+component=\{FashionRootRedirect\}/);

    // Ensure dynamic /fashion routes exist
    expect(appSource).toMatch(/<Route\s+path="\/fashion\/:section"/);
    expect(appSource).toMatch(/<Route\s+path="\/fashion\/:section\/:subsection"/);
    expect(appSource).toMatch(/<Route\s+path="\/fashion\/:section\/:subsection\/:leaf"/);

    // Ensure each /fashion route renders UniversalCategoryPage
    // section
    expect(appSource).toMatch(/<UniversalCategoryPage\s+category=\"fashion\"\s+subcategory=\{section\}\s*\/?>/);
    // subsection
    expect(appSource).toMatch(/<UniversalCategoryPage\s+category=\"fashion\"\s+subcategory=\{section\}\s+subSubcategory=\{subsection\}\s*\/?>/);
    // leaf
    expect(appSource).toMatch(/<UniversalCategoryPage\s+category=\"fashion\"\s+subcategory=\{section\}\s+subSubcategory=\{subsection\}\s+leaf=\{leaf\}\s*\/?>/);
  });

  test('No other source files define /fashion routes', () => {
    // Recursively scan client/src for any Route path="/fashion occurrences excluding App.tsx
    const clientSrc = path.resolve(repoRoot, 'src');
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name.startsWith('.')) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else if (entry.isFile() && /\.(tsx|ts|jsx|js)$/.test(entry.name)) {
          files.push(full);
        }
      }
    };
    walk(clientSrc);

    const offenders: string[] = [];
    for (const f of files) {
      if (path.resolve(f) === path.resolve(appFile)) continue;
      const src = fs.readFileSync(f, 'utf8');
      if (/<Route\s+path=\"\/fashion/.test(src)) {
        offenders.push(path.relative(repoRoot, f));
      }
    }

    expect(offenders).toEqual([]);
  });
});






