import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  UploadIcon, 
  PlayIcon, 
  PauseIcon, 
  RotateCcwIcon,
  DownloadIcon,
  EyeIcon,
  EditIcon,
  CheckIcon,
  XIcon,
  AlertCircleIcon,
  InfoIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface VideoReviewData {
  id: string;
  url: string;
  title: string;
  description: string;
  timestamp: number;
  sections: VideoSection[];
  requirements: DesignRequirement[];
  status: 'pending' | 'analyzing' | 'completed' | 'error';
}

export interface VideoSection {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  description: string;
  changes: string[];
}

export interface DesignRequirement {
  id: string;
  type: 'layout' | 'animation' | 'content' | 'interaction' | 'performance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  implementation: string;
  estimatedEffort: number; // hours
  dependencies: string[];
}

export interface VideoReviewProps {
  className?: string;
  onVideoAnalyzed?: (data: VideoReviewData) => void;
  onRequirementsExtracted?: (requirements: DesignRequirement[]) => void;
  dataTestId?: string;
}

export const VideoReviewComponent: React.FC<VideoReviewProps> = ({
  className,
  onVideoAnalyzed,
  onRequirementsExtracted,
  dataTestId = 'video-review'
}) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [reviewData, setReviewData] = useState<VideoReviewData | null>(null);
  const [requirements, setRequirements] = useState<DesignRequirement[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'analysis' | 'requirements' | 'implementation'>('upload');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate video URL
  const isValidVideoUrl = useCallback((url: string): boolean => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    const videoDomains = ['youtube.com', 'vimeo.com', 'loom.com', 'drive.google.com', 'dropbox.com'];
    
    const hasVideoExtension = videoExtensions.some(ext => url.toLowerCase().includes(ext));
    const hasVideoDomain = videoDomains.some(domain => url.toLowerCase().includes(domain));
    
    return hasVideoExtension || hasVideoDomain || url.startsWith('blob:') || url.startsWith('data:');
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid video file (MP4, WebM, OGG, MOV)');
      return;
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      alert('File size must be less than 100MB');
      return;
    }

    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    startAnalysis(url, file.name);
  }, []);

  // Handle URL input
  const handleUrlSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    
    if (!videoUrl.trim()) {
      alert('Please enter a video URL');
      return;
    }

    if (!isValidVideoUrl(videoUrl)) {
      alert('Please enter a valid video URL');
      return;
    }

    startAnalysis(videoUrl, 'External Video');
  }, [videoUrl, isValidVideoUrl]);

  // Start video analysis
  const startAnalysis = useCallback(async (url: string, title: string) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setActiveTab('analysis');

    try {
      // Simulate analysis progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // Create analysis data
      const analysisData: VideoReviewData = {
        id: `review-${Date.now()}`,
        url,
        title,
        description: 'Homepage redesign video analysis',
        timestamp: Date.now(),
        sections: [
          {
            id: 'header-section',
            name: 'Header/Navigation',
            startTime: 0,
            endTime: 15,
            description: 'Main navigation and branding elements',
            changes: ['Update logo placement', 'Improve navigation menu', 'Add search functionality']
          },
          {
            id: 'hero-section',
            name: 'Hero Section',
            startTime: 15,
            endTime: 45,
            description: 'Main call-to-action and value proposition',
            changes: ['Enhance hero messaging', 'Add animated elements', 'Improve CTA buttons']
          },
          {
            id: 'features-section',
            name: 'Features/Highlights',
            startTime: 45,
            endTime: 75,
            description: 'Key features and benefits showcase',
            changes: ['Reorganize feature layout', 'Add interactive elements', 'Improve visual hierarchy']
          }
        ],
        requirements: [],
        status: 'analyzing'
      };

      // Simulate analysis completion
      setTimeout(() => {
        setReviewData(analysisData);
        setIsAnalyzing(false);
        setActiveTab('requirements');
        onVideoAnalyzed?.(analysisData);
      }, 2000);

    } catch (error) {
      console.error('[VideoReviewComponent] Analysis failed:', error);
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  }, [onVideoAnalyzed]);

  // Extract design requirements
  const extractRequirements = useCallback(() => {
    if (!reviewData) return;

    const extractedRequirements: DesignRequirement[] = [
      {
        id: 'req-1',
        type: 'layout',
        priority: 'high',
        title: 'Responsive Header Redesign',
        description: 'Update header layout to be more responsive and accessible',
        implementation: 'Implement flexbox layout with proper breakpoints',
        estimatedEffort: 8,
        dependencies: []
      },
      {
        id: 'req-2',
        type: 'animation',
        priority: 'medium',
        title: 'Hero Section Animations',
        description: 'Add smooth animations to hero section elements',
        implementation: 'Use CSS animations and intersection observer',
        estimatedEffort: 6,
        dependencies: ['req-1']
      },
      {
        id: 'req-3',
        type: 'content',
        priority: 'high',
        title: 'Content Structure Optimization',
        description: 'Reorganize content for better user flow',
        implementation: 'Implement grid layout with proper spacing',
        estimatedEffort: 12,
        dependencies: []
      },
      {
        id: 'req-4',
        type: 'interaction',
        priority: 'medium',
        title: 'Enhanced User Interactions',
        description: 'Improve hover states and click feedback',
        implementation: 'Add micro-interactions and transition effects',
        estimatedEffort: 4,
        dependencies: ['req-2']
      },
      {
        id: 'req-5',
        type: 'performance',
        priority: 'critical',
        title: 'Performance Optimization',
        description: 'Optimize loading times and rendering performance',
        implementation: 'Implement lazy loading and code splitting',
        estimatedEffort: 10,
        dependencies: []
      }
    ];

    setRequirements(extractedRequirements);
    onRequirementsExtracted?.(extractedRequirements);
  }, [reviewData, onRequirementsExtracted]);

  // Generate implementation plan
  const generateImplementationPlan = useCallback(() => {
    if (!requirements.length) return;

    const plan = {
      totalEffort: requirements.reduce((sum, req) => sum + req.estimatedEffort, 0),
      phases: [
        {
          name: 'Phase 1: Foundation',
          requirements: requirements.filter(req => req.dependencies.length === 0),
          effort: requirements.filter(req => req.dependencies.length === 0).reduce((sum, req) => sum + req.estimatedEffort, 0)
        },
        {
          name: 'Phase 2: Enhancements',
          requirements: requirements.filter(req => req.dependencies.length > 0),
          effort: requirements.filter(req => req.dependencies.length > 0).reduce((sum, req) => sum + req.estimatedEffort, 0)
        }
      ]
    };

    return plan;
  }, [requirements]);

  useEffect(() => {
    if (reviewData && requirements.length === 0) {
      extractRequirements();
    }
  }, [reviewData, requirements.length, extractRequirements]);

  const implementationPlan = generateImplementationPlan();

  return (
    <div className={cn('video-review-container', className)} data-testid={dataTestId}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4" data-testid={`${dataTestId}-title`}>
          Video Review & Analysis
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid={`${dataTestId}-description`}>
          Upload or provide a video URL to analyze homepage redesign requirements
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        <Button
          variant={activeTab === 'upload' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('upload')}
          data-testid={`${dataTestId}-tab-upload`}
        >
          Upload Video
        </Button>
        <Button
          variant={activeTab === 'analysis' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('analysis')}
          disabled={!reviewData}
          data-testid={`${dataTestId}-tab-analysis`}
        >
          Analysis
        </Button>
        <Button
          variant={activeTab === 'requirements' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('requirements')}
          disabled={!requirements.length}
          data-testid={`${dataTestId}-tab-requirements`}
        >
          Requirements
        </Button>
        <Button
          variant={activeTab === 'implementation' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('implementation')}
          disabled={!implementationPlan}
          data-testid={`${dataTestId}-tab-implementation`}
        >
          Implementation
        </Button>
      </div>

      {/* Upload Section */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UploadIcon className="w-5 h-5" />
                <span>Upload Video File</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <UploadIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Drag and drop your video file here, or click to browse</p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-primary hover:bg-primary/90"
                  data-testid={`${dataTestId}-upload-button`}
                >
                  Choose Video File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  data-testid={`${dataTestId}-file-input`}
                />
              </div>
              <div className="text-sm text-gray-500">
                <p>Supported formats: MP4, WebM, OGG, MOV</p>
                <p>Maximum file size: 100MB</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Or Provide Video URL</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUrlSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="video-url">Video URL</Label>
                  <Input
                    id="video-url"
                    type="url"
                    placeholder="https://example.com/video.mp4 or Loom/YouTube link"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    data-testid={`${dataTestId}-url-input`}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={!videoUrl.trim()}
                  data-testid={`${dataTestId}-url-submit`}
                >
                  Analyze Video
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analysis Section */}
      {activeTab === 'analysis' && reviewData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {isAnalyzing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                ) : (
                  <CheckIcon className="w-5 h-5 text-green-500" />
                )}
                <span>Video Analysis</span>
                <Badge variant={isAnalyzing ? 'secondary' : 'default'}>
                  {isAnalyzing ? 'Analyzing...' : 'Completed'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="space-y-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${analysisProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">Analyzing video content and extracting design requirements...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Video Information</h3>
                      <div className="space-y-2 text-sm">
                        <p><strong>Title:</strong> {reviewData.title}</p>
                        <p><strong>Duration:</strong> {reviewData.sections.length} sections identified</p>
                        <p><strong>Analysis Time:</strong> {new Date(reviewData.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Identified Sections</h3>
                      <div className="space-y-2">
                        {reviewData.sections.map((section) => (
                          <div key={section.id} className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-sm">{section.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Requirements Section */}
      {activeTab === 'requirements' && requirements.length > 0 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <EditIcon className="w-5 h-5" />
                <span>Design Requirements</span>
                <Badge variant="default">{requirements.length} requirements</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requirements.map((requirement) => (
                  <Card key={requirement.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{requirement.title}</h3>
                            <Badge 
                              variant={
                                requirement.priority === 'critical' ? 'destructive' :
                                requirement.priority === 'high' ? 'default' :
                                requirement.priority === 'medium' ? 'secondary' : 'outline'
                              }
                            >
                              {requirement.priority}
                            </Badge>
                            <Badge variant="outline">{requirement.type}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{requirement.description}</p>
                          <p className="text-xs text-gray-500">
                            <strong>Implementation:</strong> {requirement.implementation}
                          </p>
                          <p className="text-xs text-gray-500">
                            <strong>Estimated Effort:</strong> {requirement.estimatedEffort} hours
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Implementation Section */}
      {activeTab === 'implementation' && implementationPlan && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckIcon className="w-5 h-5" />
                <span>Implementation Plan</span>
                <Badge variant="default">{implementationPlan.totalEffort}h total</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {implementationPlan.phases.map((phase, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">{phase.name}</h3>
                    <div className="space-y-2">
                      {phase.requirements.map((req) => (
                        <div key={req.id} className="flex items-center justify-between text-sm">
                          <span>{req.title}</span>
                          <span className="text-gray-500">{req.estimatedEffort}h</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex justify-between text-sm font-medium">
                        <span>Phase Total:</span>
                        <span>{phase.effort} hours</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="text-center">
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    data-testid={`${dataTestId}-implement-plan`}
                  >
                    Generate Implementation Code
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default VideoReviewComponent; 