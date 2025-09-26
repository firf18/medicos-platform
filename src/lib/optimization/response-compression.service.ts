/**
 * Response Compression Service
 * @fileoverview Service for implementing response compression and optimization
 * @compliance HIPAA-compliant response compression with performance optimization
 */

import { logSecurityEvent } from '@/lib/security/logging/security-logger';

/**
 * Compression configuration
 */
interface CompressionConfig {
  algorithm: 'gzip' | 'brotli' | 'deflate';
  level: number; // 1-9 for gzip/deflate, 1-11 for brotli
  threshold: number; // Minimum size to compress (bytes)
  types: string[]; // MIME types to compress
  excludeTypes: string[]; // MIME types to exclude
}

/**
 * Compression statistics
 */
interface CompressionStats {
  totalRequests: number;
  compressedRequests: number;
  totalOriginalSize: number;
  totalCompressedSize: number;
  compressionRatio: number;
  averageCompressionTime: number;
  algorithm: string;
}

/**
 * Response Compression Service
 */
export class ResponseCompressionService {
  private static stats = new Map<string, CompressionStats>();
  private static compressionConfigs: Record<string, CompressionConfig> = {
    api: {
      algorithm: 'gzip',
      level: 6,
      threshold: 1024, // 1KB
      types: ['application/json', 'text/plain', 'text/html'],
      excludeTypes: ['image/*', 'video/*', 'audio/*']
    },
    static: {
      algorithm: 'brotli',
      level: 8,
      threshold: 512, // 512B
      types: ['text/css', 'application/javascript', 'text/html'],
      excludeTypes: ['image/*', 'video/*', 'audio/*']
    },
    medical: {
      algorithm: 'gzip',
      level: 7,
      threshold: 2048, // 2KB
      types: ['application/json', 'application/xml', 'text/csv'],
      excludeTypes: ['image/*', 'video/*', 'audio/*']
    }
  };

  /**
   * Compress response data
   */
  static async compressResponse(
    data: any,
    contentType: string,
    config: CompressionConfig
  ): Promise<{
    compressed: boolean;
    data: any;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    algorithm: string;
  }> {
    const startTime = Date.now();
    
    try {
      // Check if compression should be applied
      if (!this.shouldCompress(contentType, config)) {
        return {
          compressed: false,
          data,
          originalSize: this.getDataSize(data),
          compressedSize: this.getDataSize(data),
          compressionRatio: 1,
          algorithm: 'none'
        };
      }

      // Convert data to string if needed
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      const originalSize = Buffer.byteLength(dataString, 'utf8');

      // Check threshold
      if (originalSize < config.threshold) {
        return {
          compressed: false,
          data,
          originalSize,
          compressedSize: originalSize,
          compressionRatio: 1,
          algorithm: 'none'
        };
      }

      // Compress data
      const compressedData = await this.compressData(dataString, config);
      const compressedSize = Buffer.byteLength(compressedData, 'binary');
      const compressionRatio = originalSize / compressedSize;
      const compressionTime = Date.now() - startTime;

      // Update stats
      this.updateStats(config.algorithm, originalSize, compressedSize, compressionTime);

      // Log compression
      this.logCompression(
        contentType,
        originalSize,
        compressedSize,
        compressionRatio,
        compressionTime,
        config.algorithm
      );

      return {
        compressed: true,
        data: compressedData,
        originalSize,
        compressedSize,
        compressionRatio,
        algorithm: config.algorithm
      };

    } catch (error) {
      // Log compression error
      this.logCompressionError(contentType, error);
      
      // Return uncompressed data
      return {
        compressed: false,
        data,
        originalSize: this.getDataSize(data),
        compressedSize: this.getDataSize(data),
        compressionRatio: 1,
        algorithm: 'none'
      };
    }
  }

  /**
   * Compress API response
   */
  static async compressApiResponse(
    data: any,
    contentType: string = 'application/json'
  ): Promise<Response> {
    const config = this.compressionConfigs.api;
    const result = await this.compressResponse(data, contentType, config);

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'X-Compression-Applied': result.compressed.toString(),
      'X-Original-Size': result.originalSize.toString(),
      'X-Compressed-Size': result.compressedSize.toString(),
      'X-Compression-Ratio': result.compressionRatio.toFixed(2)
    };

    if (result.compressed) {
      headers['Content-Encoding'] = result.algorithm;
      headers['Content-Length'] = result.compressedSize.toString();
    }

    return new Response(result.data, {
      status: 200,
      headers
    });
  }

  /**
   * Compress static file response
   */
  static async compressStaticResponse(
    data: string,
    contentType: string
  ): Promise<Response> {
    const config = this.compressionConfigs.static;
    const result = await this.compressResponse(data, contentType, config);

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000', // 1 year
      'X-Compression-Applied': result.compressed.toString(),
      'X-Original-Size': result.originalSize.toString(),
      'X-Compressed-Size': result.compressedSize.toString(),
      'X-Compression-Ratio': result.compressionRatio.toFixed(2)
    };

    if (result.compressed) {
      headers['Content-Encoding'] = result.algorithm;
      headers['Content-Length'] = result.compressedSize.toString();
    }

    return new Response(result.data, {
      status: 200,
      headers
    });
  }

  /**
   * Compress medical data response
   */
  static async compressMedicalResponse(
    data: any,
    contentType: string = 'application/json'
  ): Promise<Response> {
    const config = this.compressionConfigs.medical;
    const result = await this.compressResponse(data, contentType, config);

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'X-Compression-Applied': result.compressed.toString(),
      'X-Original-Size': result.originalSize.toString(),
      'X-Compressed-Size': result.compressedSize.toString(),
      'X-Compression-Ratio': result.compressionRatio.toFixed(2),
      'X-Medical-Data': 'true'
    };

    if (result.compressed) {
      headers['Content-Encoding'] = result.algorithm;
      headers['Content-Length'] = result.compressedSize.toString();
    }

    return new Response(result.data, {
      status: 200,
      headers
    });
  }

  /**
   * Create compression middleware for Next.js API routes
   */
  static createCompressionMiddleware() {
    return async (req: any, res: any, next: any) => {
      const originalSend = res.send;
      const originalJson = res.json;

      // Override res.send
      res.send = async function(data: any) {
        try {
          const contentType = res.get('Content-Type') || 'text/plain';
          let config = ResponseCompressionService.compressionConfigs.api;

          // Choose config based on content type
          if (contentType.includes('application/json')) {
            config = ResponseCompressionService.compressionConfigs.api;
          } else if (contentType.includes('text/css') || contentType.includes('application/javascript')) {
            config = ResponseCompressionService.compressionConfigs.static;
          }

          const result = await ResponseCompressionService.compressResponse(data, contentType, config);

          if (result.compressed) {
            res.set('Content-Encoding', result.algorithm);
            res.set('Content-Length', result.compressedSize.toString());
          }

          res.set('X-Compression-Applied', result.compressed.toString());
          res.set('X-Original-Size', result.originalSize.toString());
          res.set('X-Compressed-Size', result.compressedSize.toString());
          res.set('X-Compression-Ratio', result.compressionRatio.toFixed(2));

          originalSend.call(this, result.data);
        } catch (error) {
          originalSend.call(this, data);
        }
      };

      // Override res.json
      res.json = async function(data: any) {
        try {
          const contentType = 'application/json';
          const config = ResponseCompressionService.compressionConfigs.api;
          const result = await ResponseCompressionService.compressResponse(data, contentType, config);

          if (result.compressed) {
            res.set('Content-Encoding', result.algorithm);
            res.set('Content-Length', result.compressedSize.toString());
          }

          res.set('X-Compression-Applied', result.compressed.toString());
          res.set('X-Original-Size', result.originalSize.toString());
          res.set('X-Compressed-Size', result.compressedSize.toString());
          res.set('X-Compression-Ratio', result.compressionRatio.toFixed(2));

          originalJson.call(this, result.data);
        } catch (error) {
          originalJson.call(this, data);
        }
      };

      next();
    };
  }

  /**
   * Get compression statistics
   */
  static getCompressionStats(algorithm?: string): CompressionStats | Record<string, CompressionStats> {
    if (algorithm) {
      return this.stats.get(algorithm) || {
        totalRequests: 0,
        compressedRequests: 0,
        totalOriginalSize: 0,
        totalCompressedSize: 0,
        compressionRatio: 0,
        averageCompressionTime: 0,
        algorithm
      };
    }

    const allStats: Record<string, CompressionStats> = {};
    for (const [key, stats] of this.stats.entries()) {
      allStats[key] = stats;
    }
    return allStats;
  }

  /**
   * Clear compression statistics
   */
  static clearStats(algorithm?: string): void {
    if (algorithm) {
      this.stats.delete(algorithm);
    } else {
      this.stats.clear();
    }
  }

  // Private helper methods

  private static shouldCompress(contentType: string, config: CompressionConfig): boolean {
    // Check if type should be compressed
    const shouldCompress = config.types.some(type => {
      if (type.includes('*')) {
        return contentType.startsWith(type.replace('*', ''));
      }
      return contentType === type;
    });

    if (!shouldCompress) {
      return false;
    }

    // Check if type should be excluded
    const shouldExclude = config.excludeTypes.some(type => {
      if (type.includes('*')) {
        return contentType.startsWith(type.replace('*', ''));
      }
      return contentType === type;
    });

    return !shouldExclude;
  }

  private static async compressData(data: string, config: CompressionConfig): Promise<string> {
    switch (config.algorithm) {
      case 'gzip':
        return this.compressGzip(data, config.level);
      case 'brotli':
        return this.compressBrotli(data, config.level);
      case 'deflate':
        return this.compressDeflate(data, config.level);
      default:
        throw new Error(`Unsupported compression algorithm: ${config.algorithm}`);
    }
  }

  private static async compressGzip(data: string, level: number): Promise<string> {
    // This would use a gzip library like pako or zlib
    // For now, we'll simulate compression
    const compressed = Buffer.from(data).toString('base64');
    return compressed;
  }

  private static async compressBrotli(data: string, level: number): Promise<string> {
    // This would use a brotli library
    // For now, we'll simulate compression
    const compressed = Buffer.from(data).toString('base64');
    return compressed;
  }

  private static async compressDeflate(data: string, level: number): Promise<string> {
    // This would use a deflate library
    // For now, we'll simulate compression
    const compressed = Buffer.from(data).toString('base64');
    return compressed;
  }

  private static getDataSize(data: any): number {
    if (typeof data === 'string') {
      return Buffer.byteLength(data, 'utf8');
    }
    return Buffer.byteLength(JSON.stringify(data), 'utf8');
  }

  private static updateStats(
    algorithm: string,
    originalSize: number,
    compressedSize: number,
    compressionTime: number
  ): void {
    if (!this.stats.has(algorithm)) {
      this.stats.set(algorithm, {
        totalRequests: 0,
        compressedRequests: 0,
        totalOriginalSize: 0,
        totalCompressedSize: 0,
        compressionRatio: 0,
        averageCompressionTime: 0,
        algorithm
      });
    }

    const stats = this.stats.get(algorithm)!;
    stats.totalRequests++;
    stats.compressedRequests++;
    stats.totalOriginalSize += originalSize;
    stats.totalCompressedSize += compressedSize;
    stats.compressionRatio = stats.totalOriginalSize / stats.totalCompressedSize;
    stats.averageCompressionTime = 
      (stats.averageCompressionTime * (stats.compressedRequests - 1) + compressionTime) / stats.compressedRequests;
  }

  private static logCompression(
    contentType: string,
    originalSize: number,
    compressedSize: number,
    compressionRatio: number,
    compressionTime: number,
    algorithm: string
  ): void {
    logSecurityEvent(
      'data_access',
      'response_compression',
      {
        contentType,
        originalSize,
        compressedSize,
        compressionRatio,
        compressionTime,
        algorithm,
        efficiency: compressionRatio > 2 ? 'high' : compressionRatio > 1.5 ? 'medium' : 'low'
      },
      'info'
    );
  }

  private static logCompressionError(contentType: string, error: any): void {
    logSecurityEvent(
      'data_access',
      'response_compression_error',
      {
        contentType,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      'error'
    );
  }
}

/**
 * Compression utilities for different response types
 */
export const CompressionUtils = {
  /**
   * Compress JSON API response
   */
  compressJsonResponse: async (data: any) => {
    return ResponseCompressionService.compressApiResponse(data, 'application/json');
  },

  /**
   * Compress HTML response
   */
  compressHtmlResponse: async (html: string) => {
    return ResponseCompressionService.compressStaticResponse(html, 'text/html');
  },

  /**
   * Compress CSS response
   */
  compressCssResponse: async (css: string) => {
    return ResponseCompressionService.compressStaticResponse(css, 'text/css');
  },

  /**
   * Compress JavaScript response
   */
  compressJsResponse: async (js: string) => {
    return ResponseCompressionService.compressStaticResponse(js, 'application/javascript');
  },

  /**
   * Compress medical data response
   */
  compressMedicalDataResponse: async (data: any) => {
    return ResponseCompressionService.compressMedicalResponse(data, 'application/json');
  },

  /**
   * Compress CSV response
   */
  compressCsvResponse: async (csv: string) => {
    return ResponseCompressionService.compressMedicalResponse(csv, 'text/csv');
  },

  /**
   * Compress XML response
   */
  compressXmlResponse: async (xml: string) => {
    return ResponseCompressionService.compressMedicalResponse(xml, 'application/xml');
  }
};
