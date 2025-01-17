export class ImageOptimizer {
  constructor() {
    this.maxWidth = 1920;
    this.quality = 0.8;
    this.supportedFormats = ['image/webp', 'image/jpeg', 'image/png'];
  }

  async optimizeImage(file) {
    try {
      // Check if the file is an image
      if (!file.type.startsWith('image/')) {
        throw new Error('File is not an image');
      }

      // Create image element
      const img = await this.createImageFromFile(file);
      
      // Resize if needed
      const { width, height } = this.calculateDimensions(img);
      
      // Create canvas with new dimensions
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // Draw image to canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to WebP if supported
      if (this.isWebPSupported()) {
        return await this.convertToWebP(canvas);
      }
      
      // Fallback to original format
      return await this.canvasToBlob(canvas, file.type);
    } catch (error) {
      console.error('Image optimization failed:', error);
      return file; // Return original file if optimization fails
    }
  }

  async createImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  calculateDimensions(img) {
    let width = img.naturalWidth;
    let height = img.naturalHeight;
    
    if (width > this.maxWidth) {
      const ratio = this.maxWidth / width;
      width = this.maxWidth;
      height = Math.round(height * ratio);
    }
    
    return { width, height };
  }

  isWebPSupported() {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  async convertToWebP(canvas) {
    return await this.canvasToBlob(canvas, 'image/webp');
  }

  canvasToBlob(canvas, type) {
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        type,
        this.quality
      );
    });
  }

  // Helper method for generating responsive sizes
  generateResponsiveSizes(file, sizes = [320, 640, 960, 1280, 1920]) {
    return Promise.all(
      sizes.map(async (size) => {
        this.maxWidth = size;
        const optimizedImage = await this.optimizeImage(file);
        return {
          size,
          blob: optimizedImage,
          url: URL.createObjectURL(optimizedImage)
        };
      })
    );
  }
}
