export interface UniversalPageConfiguration {
  metadata: { title?: string };
  sampleProducts?: Array<{ id: string; title: string; brand: string; category?: string }>;
}
export const universalCategoryPageFactory: {
  getConfiguration: (...args: any[]) => Promise<{ isError: () => boolean; error?: Error; value?: UniversalPageConfiguration }>;
};


