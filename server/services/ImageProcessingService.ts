// Image Processing Service - Enterprise-grade image handling
import { Logger } from '../middleware/Logger.js';
import fetch from 'node-fetch';
import sharp from 'sharp';
import AWS from 'aws-sdk';

export interface ImageProcessingConfig {
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucketName: string;
  };
  allowedFormats: string[];
  maxSizeBytes: number;
  thumbnailSizes: Array<{ width: number; height: number; suffix: string }>;
  qualityOptimization: {
    jpeg: number;
    webp: number;
    png: number;
  };
  enableWatermark: boolean;
  watermarkPath?: string;
}

export interface ImageProcessingOptions {
  generateThumbnail?: boolean;
  optimizeQuality?: boolean;
  addWatermark?: boolean;
  customSizes?: Array<{ width: number; height: number; suffix: string }>;
}

export class ImageProcessingService {
  private logger: Logger;
  private config: ImageProcessingConfig;
  private s3: AWS.S3;

  constructor(config: ImageProcessingConfig) {
    this.config = config;
    this.logger = new Logger('ImageProcessingService');

    // Initialize AWS S3
    AWS.config.update({
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
      region: config.aws.region
    });

    this.s3 = new AWS.S3();
  }

  async validateImage(imageUrl: string): Promise<boolean> {
    try {
      // Check if URL is accessible
      const response = await fetch(imageUrl, { method: 'HEAD' });
      
      if (!response.ok) {
        this.logger.warn('Image URL not accessible', { imageUrl, status: response.status });
        return false;
      }

      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !this.isValidImageFormat(contentType)) {
        this.logger.warn('Invalid image format', { imageUrl, contentType });
        return false;
      }

      // Check file size
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > this.config.maxSizeBytes) {
        this.logger.warn('Image too large', { imageUrl, size: contentLength });
        return false;
      }

      return true;

    } catch (error) {
      this.logger.error('Image validation failed', { imageUrl, error: error.message });
      return false;
    }
  }

  async processImage(
    imageUrl: string,
    options: ImageProcessingOptions = {}
  ): Promise<string> {
    try {
      // Download image
      const imageBuffer = await this.downloadImage(imageUrl);
      
      // Get image metadata
      const metadata = await sharp(imageBuffer).metadata();
      this.logger.debug('Processing image', {
        originalUrl: imageUrl,
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        size: metadata.size
      });

      const processedImages: Array<{ buffer: Buffer; key: string }> = [];

      // Process original image
      let processedBuffer = imageBuffer;
      
      if (options.optimizeQuality) {
        processedBuffer = await this.optimizeImage(imageBuffer, metadata.format);
      }

      if (options.addWatermark && this.config.enableWatermark && this.config.watermarkPath) {
        processedBuffer = await this.addWatermark(processedBuffer);
      }

      // Generate main image key
      const mainImageKey = this.generateImageKey('main');
      processedImages.push({ buffer: processedBuffer, key: mainImageKey });

      // Generate thumbnails
      if (options.generateThumbnail) {
        const thumbnailSizes = options.customSizes || this.config.thumbnailSizes;
        
        for (const size of thumbnailSizes) {
          const thumbnailBuffer = await this.generateThumbnail(
            processedBuffer,
            size.width,
            size.height
          );
          
          const thumbnailKey = this.generateImageKey(size.suffix);
          processedImages.push({ buffer: thumbnailBuffer, key: thumbnailKey });
        }
      }

      // Upload all processed images to S3
      const uploadPromises = processedImages.map(({ buffer, key }) =>
        this.uploadToS3(buffer, key, metadata.format)
      );

      const uploadResults = await Promise.all(uploadPromises);
      
      // Return main image URL
      const mainImageUrl = uploadResults[0];
      
      this.logger.info('Image processing completed', {
        originalUrl: imageUrl,
        processedUrl: mainImageUrl,
        totalVariants: processedImages.length
      });

      return mainImageUrl;

    } catch (error) {
      this.logger.error('Image processing failed', {
        imageUrl,
        options,
        error: error.message
      });
      
      // Return original URL as fallback
      return imageUrl;
    }
  }

  async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      // Extract S3 key from URL
      const key = this.extractS3Key(imageUrl);
      if (!key) {
        this.logger.warn('Cannot extract S3 key from URL', { imageUrl });
        return false;
      }

      await this.s3.deleteObject({
        Bucket: this.config.aws.bucketName,
        Key: key
      }).promise();

      this.logger.debug('Image deleted from S3', { imageUrl, key });
      return true;

    } catch (error) {
      this.logger.error('Failed to delete image', {
        imageUrl,
        error: error.message
      });
      return false;
    }
  }

  async getImageMetadata(imageUrl: string): Promise<{
    width: number;
    height: number;
    format: string;
    size: number;
  } | null> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        return null;
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const metadata = await sharp(buffer).metadata();

      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: metadata.size || 0
      };

    } catch (error) {
      this.logger.error('Failed to get image metadata', {
        imageUrl,
        error: error.message
      });
      return null;
    }
  }

  private async downloadImage(imageUrl: string): Promise<Buffer> {
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  private async optimizeImage(buffer: Buffer, format?: string): Promise<Buffer> {
    let sharpInstance = sharp(buffer);

    switch (format) {
      case 'jpeg':
      case 'jpg':
        return sharpInstance
          .jpeg({ quality: this.config.qualityOptimization.jpeg })
          .toBuffer();
      
      case 'png':
        return sharpInstance
          .png({ quality: this.config.qualityOptimization.png })
          .toBuffer();
      
      case 'webp':
        return sharpInstance
          .webp({ quality: this.config.qualityOptimization.webp })
          .toBuffer();
      
      default:
        // Convert to JPEG as default optimization
        return sharpInstance
          .jpeg({ quality: this.config.qualityOptimization.jpeg })
          .toBuffer();
    }
  }

  private async generateThumbnail(
    buffer: Buffer,
    width: number,
    height: number
  ): Promise<Buffer> {
    return sharp(buffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: this.config.qualityOptimization.jpeg })
      .toBuffer();
  }

  private async addWatermark(buffer: Buffer): Promise<Buffer> {
    if (!this.config.watermarkPath) {
      return buffer;
    }

    try {
      const watermark = await sharp(this.config.watermarkPath)
        .resize(100, 100, { fit: 'contain' })
        .png()
        .toBuffer();

      return sharp(buffer)
        .composite([{
          input: watermark,
          gravity: 'southeast'
        }])
        .toBuffer();

    } catch (error) {
      this.logger.warn('Failed to add watermark', { error: error.message });
      return buffer;
    }
  }

  private async uploadToS3(
    buffer: Buffer,
    key: string,
    format?: string
  ): Promise<string> {
    const contentType = this.getContentType(format);
    
    const uploadParams: AWS.S3.PutObjectRequest = {
      Bucket: this.config.aws.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read',
      CacheControl: 'max-age=31536000', // 1 year
      Metadata: {
        'uploaded-by': 'bazaar-image-service',
        'upload-time': new Date().toISOString()
      }
    };

    const result = await this.s3.upload(uploadParams).promise();
    return result.Location;
  }

  private generateImageKey(suffix: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 8);
    return `fashion-listings/${timestamp}-${random}-${suffix}.jpg`;
  }

  private extractS3Key(imageUrl: string): string | null {
    try {
      const url = new URL(imageUrl);
      // Extract key from S3 URL format
      const pathParts = url.pathname.split('/');
      return pathParts.slice(1).join('/'); // Remove leading slash
    } catch {
      return null;
    }
  }

  private isValidImageFormat(contentType: string): boolean {
    const imageFormats = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/gif'
    ];
    
    return imageFormats.includes(contentType.toLowerCase());
  }

  private getContentType(format?: string): string {
    switch (format?.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      case 'gif':
        return 'image/gif';
      default:
        return 'image/jpeg';
    }
  }
}

// Factory function
export function createImageProcessingService(config?: Partial<ImageProcessingConfig>): ImageProcessingService {
  const defaultConfig: ImageProcessingConfig = {
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      region: process.env.AWS_REGION || 'us-east-1',
      bucketName: process.env.AWS_S3_BUCKET || 'bazaar-images'
    },
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    thumbnailSizes: [
      { width: 150, height: 150, suffix: 'thumb' },
      { width: 300, height: 300, suffix: 'small' },
      { width: 600, height: 600, suffix: 'medium' }
    ],
    qualityOptimization: {
      jpeg: 85,
      webp: 80,
      png: 90
    },
    enableWatermark: false
  };

  return new ImageProcessingService({ ...defaultConfig, ...config });
}
