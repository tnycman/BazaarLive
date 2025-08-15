import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import HomePageShowcase from '@/components/showcase/HomePageShowcase';

export default function ShowcaseDemo() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HomePageShowcase 
          title="BazaarLive Home Page Redesign"
          description="Experience the next generation of social marketplace design"
          autoPlay={false}
          muted={true}
          loop={true}
          showControls={true}
          dataTestId="showcase-demo"
        />
      </main>
    </div>
  );
} 
 