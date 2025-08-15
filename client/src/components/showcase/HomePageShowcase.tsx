import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import VideoPlayer from '@/components/ui/video-player';
import { 
  PlayIcon, 
  PauseIcon, 
  RotateCcwIcon, 
  MaximizeIcon,
  SmartphoneIcon,
  TabletIcon,
  MonitorIcon,
  ZapIcon,
  SparklesIcon,
  TrendingUpIcon,
  UsersIcon,
  HeartIcon
} from 'lucide-react';

export interface HomePageShowcaseProps {
  className?: string;
  title?: string;
  description?: string;
  showControls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  dataTestId?: string;
}

export interface ShowcaseFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  gradient: string;
}

export const HomePageShowcase: React.FC<HomePageShowcaseProps> = ({
  className,
  title = "BazaarLive Home Page Redesign",
  description = "Experience the next generation of social marketplace design",
  showControls = true,
  autoPlay = false,
  muted = true,
  loop = true,
  dataTestId = 'homepage-showcase'
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isPlaying, setIsPlaying] = useState(false);

  // Sample video URLs - replace with your actual redesign videos
  const showcaseVideos = {
    desktop: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    tablet: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    mobile: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
  };

  // Sample poster images for video thumbnails
  const posterImages = {
    desktop: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=675',
    tablet: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
    mobile: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600'
  };

  // Key features of the redesign
  const redesignFeatures: ShowcaseFeature[] = [
    {
      id: 'performance',
      title: 'Lightning Fast',
      description: 'Optimized for speed with lazy loading and efficient rendering',
      icon: ZapIcon,
      color: 'text-yellow-500',
      gradient: 'from-yellow-400 to-orange-500'
    },
    {
      id: 'modern-ui',
      title: 'Modern Design',
      description: 'Glass morphism effects and smooth animations throughout',
      icon: SparklesIcon,
      color: 'text-purple-500',
      gradient: 'from-purple-400 to-pink-500'
    },
    {
      id: 'engagement',
      title: 'Enhanced Engagement',
      description: 'Interactive elements and social features that drive user interaction',
      icon: TrendingUpIcon,
      color: 'text-green-500',
      gradient: 'from-green-400 to-emerald-500'
    },
    {
      id: 'community',
      title: 'Community Focus',
      description: 'Built around social connections and user-generated content',
      icon: UsersIcon,
      color: 'text-blue-500',
      gradient: 'from-blue-400 to-indigo-500'
    }
  ];

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const getCurrentVideo = () => {
    switch (activeTab) {
      case 'desktop':
        return showcaseVideos.desktop;
      case 'tablet':
        return showcaseVideos.tablet;
      case 'mobile':
        return showcaseVideos.mobile;
      default:
        return showcaseVideos.desktop;
    }
  };

  const getCurrentPoster = () => {
    switch (activeTab) {
      case 'desktop':
        return posterImages.desktop;
      case 'tablet':
        return posterImages.tablet;
      case 'mobile':
        return posterImages.mobile;
      default:
        return posterImages.desktop;
    }
  };

  return (
    <div className={className} data-testid={dataTestId}>
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid={`${dataTestId}-title`}>
          {title}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid={`${dataTestId}-description`}>
          {description}
        </p>
      </div>

      {/* Main Showcase Section */}
      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl" data-testid={`${dataTestId}-video-title`}>
                  Interactive Demo
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {isPlaying ? 'Playing' : 'Paused'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(getCurrentVideo(), '_blank')}
                    data-testid={`${dataTestId}-download-video`}
                  >
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <VideoPlayer
                src={getCurrentVideo()}
                poster={getCurrentPoster()}
                title="BazaarLive Home Page Redesign"
                description="Experience the new design across all devices"
                autoPlay={autoPlay}
                muted={muted}
                loop={loop}
                controls={showControls}
                aspectRatio="16/9"
                showPlayButton={true}
                showControls={true}
                onPlay={handlePlay}
                onPause={handlePause}
                dataTestId={`${dataTestId}-video-player`}
              />
            </CardContent>
          </Card>
        </div>

        {/* Device Tabs */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Device Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="desktop" className="flex items-center space-x-2" data-testid={`${dataTestId}-tab-desktop`}>
                    <MonitorIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Desktop</span>
                  </TabsTrigger>
                  <TabsTrigger value="tablet" className="flex items-center space-x-2" data-testid={`${dataTestId}-tab-tablet`}>
                    <TabletIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Tablet</span>
                  </TabsTrigger>
                  <TabsTrigger value="mobile" className="flex items-center space-x-2" data-testid={`${dataTestId}-tab-mobile`}>
                    <SmartphoneIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Mobile</span>
                  </TabsTrigger>
                </TabsList>
                
                <div className="mt-4 space-y-4">
                  <TabsContent value="desktop" className="space-y-4">
                    <div className="text-center">
                      <MonitorIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <h3 className="font-semibold text-gray-900">Desktop Experience</h3>
                      <p className="text-sm text-gray-600">Full-featured design with advanced navigation</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="tablet" className="space-y-4">
                    <div className="text-center">
                      <TabletIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <h3 className="font-semibold text-gray-900">Tablet Experience</h3>
                      <p className="text-sm text-gray-600">Optimized for touch and larger screens</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="mobile" className="space-y-4">
                    <div className="text-center">
                      <SmartphoneIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <h3 className="font-semibold text-gray-900">Mobile Experience</h3>
                      <p className="text-sm text-gray-600">Streamlined for on-the-go usage</p>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Redesign Highlights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">40%</div>
                  <div className="text-sm text-gray-600">Faster Load</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">60%</div>
                  <div className="text-sm text-gray-600">More Engagement</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">85%</div>
                  <div className="text-sm text-gray-600">User Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">3x</div>
                  <div className="text-sm text-gray-600">Conversion Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center" data-testid={`${dataTestId}-features-title`}>
          Key Design Features
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {redesignFeatures.map((feature) => (
            <Card key={feature.id} className="group hover:shadow-lg transition-all duration-300" data-testid={`${dataTestId}-feature-${feature.id}`}>
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="text-white text-2xl w-8 h-8" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2" data-testid={`${dataTestId}-feature-title-${feature.id}`}>
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600" data-testid={`${dataTestId}-feature-description-${feature.id}`}>
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Interactive Demo Controls */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Demo Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => {
                // Reset video to beginning
                const videoElement = document.querySelector('video') as HTMLVideoElement;
                if (videoElement) {
                  videoElement.currentTime = 0;
                  videoElement.play();
                }
              }}
              variant="outline"
              className="flex items-center space-x-2"
              data-testid={`${dataTestId}-restart-demo`}
            >
              <RotateCcwIcon className="w-4 h-4" />
              <span>Restart Demo</span>
            </Button>
            
            <Button
              onClick={() => {
                // Toggle fullscreen
                const videoContainer = document.querySelector('.video-player-container') as HTMLElement;
                if (videoContainer) {
                  videoContainer.requestFullscreen();
                }
              }}
              variant="outline"
              className="flex items-center space-x-2"
              data-testid={`${dataTestId}-fullscreen-demo`}
            >
              <MaximizeIcon className="w-4 h-4" />
              <span>Fullscreen</span>
            </Button>
            
            <Button
              onClick={() => {
                // Download video
                const link = document.createElement('a');
                link.href = getCurrentVideo();
                link.download = `bazaarlive-redesign-${activeTab}.mp4`;
                link.click();
              }}
              variant="outline"
              className="flex items-center space-x-2"
              data-testid={`${dataTestId}-download-demo`}
            >
              <HeartIcon className="w-4 h-4" />
              <span>Download Video</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-primary to-purple-600 text-white">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-4" data-testid={`${dataTestId}-cta-title`}>
            Ready to Experience the New Design?
          </h3>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            The redesigned BazaarLive home page brings together modern design principles, 
            enhanced performance, and improved user experience across all devices.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-gray-100"
              data-testid={`${dataTestId}-cta-primary`}
            >
              View Live Demo
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10"
              data-testid={`${dataTestId}-cta-secondary`}
            >
              Download Assets
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePageShowcase; 