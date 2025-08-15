import React from 'react';
import VideoPlayer from '@/components/ui/video-player';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const VideoExample: React.FC = () => {
  // Sample video URLs - replace with your actual redesign videos
  const sampleVideos = {
    hero: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    mobile: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    desktop: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
  };

  const posterImages = {
    hero: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=675',
    mobile: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600',
    desktop: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'
  };

  return (
    <div className="space-y-8">
      {/* Hero Video Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Badge variant="secondary">Hero Section</Badge>
            <span>Home Page Redesign Demo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VideoPlayer
            src={sampleVideos.hero}
            poster={posterImages.hero}
            title="BazaarLive Home Page Redesign"
            description="Experience the new design with enhanced performance and modern UI"
            autoPlay={false}
            muted={true}
            loop={true}
            controls={true}
            aspectRatio="16/9"
            showPlayButton={true}
            showControls={true}
            dataTestId="hero-video-demo"
          />
        </CardContent>
      </Card>

      {/* Device Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mobile Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <VideoPlayer
              src={sampleVideos.mobile}
              poster={posterImages.mobile}
              title="Mobile Redesign"
              description="Optimized for touch and on-the-go usage"
              autoPlay={false}
              muted={true}
              loop={true}
              controls={true}
              aspectRatio="9/16"
              showPlayButton={true}
              showControls={true}
              dataTestId="mobile-video-demo"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Desktop Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <VideoPlayer
              src={sampleVideos.desktop}
              poster={posterImages.desktop}
              title="Desktop Redesign"
              description="Full-featured design with advanced navigation"
              autoPlay={false}
              muted={true}
              loop={true}
              controls={true}
              aspectRatio="16/9"
              showPlayButton={true}
              showControls={true}
              dataTestId="desktop-video-demo"
            />
          </CardContent>
        </Card>
      </div>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use This Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Video Requirements</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• MP4, WebM, or OGG format</li>
                <li>• Recommended: 1280x720 or higher</li>
                <li>• Keep file size under 10MB for web</li>
                <li>• Include poster image for thumbnail</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Implementation</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Replace sample URLs with your videos</li>
                <li>• Upload videos to CDN or hosting service</li>
                <li>• Test across different devices</li>
                <li>• Optimize for mobile performance</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Code Example:</h4>
            <pre className="text-sm text-gray-700 overflow-x-auto">
{`<VideoPlayer
  src="your-video-url.mp4"
  poster="your-poster-image.jpg"
  title="Your Title"
  description="Your description"
  autoPlay={false}
  muted={true}
  loop={true}
  controls={true}
  aspectRatio="16/9"
  dataTestId="your-video-id"
/>`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoExample; 