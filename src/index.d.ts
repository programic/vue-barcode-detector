/**
 * Copyright (c) Programic 2026.
 *
 * This code was written by Programic. For more information, please refer to the LICENSE.md file distributed
 * with this software. For more information, visit https://programic.com/.
 */

import type { Ref } from 'vue';

/**
 * Used for the data object that is returned after successfully detecting a barcode.
 */
export interface ScannedBarcodeData {
  timestamp: number;
  value: string;
}

/**
 * Used for the callback that should be provided when listening to the detector.
 */
export interface BarcodeScannerListenerCallback {
  (barcodeData: ScannedBarcodeData): void;
}

/**
 * Used as type for the exports of the Vue composable `useBarcodeDetector()`.
 */
export interface BarcodeScannerComposableExports {
  barcode: Ref<string>;
  listen: (callback: BarcodeScannerListenerCallback) => void;
  stopListening: () => void;
}

/**
 * Used as type for the listener configuration.
 */
export interface ScannedBarcodeOptions {
  timeout?: number;
  isPreventDefault?: boolean;
}
