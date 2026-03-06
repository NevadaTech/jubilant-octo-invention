/**
 * Type declarations for the Barcode Detection API (experimental).
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API
 */

interface DetectedBarcode {
  readonly rawValue: string;
  readonly format: string;
  readonly boundingBox: DOMRectReadOnly;
  readonly cornerPoints: ReadonlyArray<{ x: number; y: number }>;
}

interface BarcodeDetectorOptions {
  formats?: string[];
}

declare class BarcodeDetector {
  constructor(options?: BarcodeDetectorOptions);
  static getSupportedFormats(): Promise<string[]>;
  detect(image: ImageBitmapSource): Promise<DetectedBarcode[]>;
}
