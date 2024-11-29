/**
 * Copyright (c) Programic 2024.
 *
 * This code was written by Programic. For more information, please refer to the LICENSE.md file distributed
 * with this software. For more information, visit https://programic.com/.
 */

import { onBeforeUnmount, ref } from 'vue';

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
interface BarcodeScannerComposableExports {
  barcode: Ref<string>;
  listen: (callback: BarcodeScannerListenerCallback) => void;
  stopListening: () => void;
}

/**
 * Keyboard constant values.
 */
const keyboard = {
  event: 'keydown',
  key: {
    enter: 'Enter',
    shift: 'Shift',
  },
};

/**
 * The event listener timeout configuration.
 */
const config = {
  timeout: 100,
};

/**
 * The composable `useBarcodeDetector()` can be imported and used for detecting physical barcode scanners.
 *
 * Typically, these devices fire keyboard events when scanning barcodes. This composable is able to
 * listen to these events and store and return the data that was read. Each character in a barcode value
 * is a separate event, followed by an Enter to indicate the end of the stream.
 */
export default function useBarcodeDetector(): BarcodeScannerComposableExports {
  let barcodeScannerInterval: NodeJS.Timeout | null = null;
  let listeningActive: boolean = false;
  let onScanCallback: BarcodeScannerListenerCallback | undefined;

  const barcode = ref<string>('');

  /**
   * Acts as a factory method for creating a new barcode data object.
   * This object contains the value the barcode and a timestamp for when it was scanned.
   */
  function createScannedBarcodeData(barcodeValue: string): ScannedBarcodeData {
    const date = new Date();

    return {
      timestamp: date.getTime(),
      value: barcodeValue,
    };
  }

  /**
   * This function is used as a callback on registering the DOM event listeners. It checks on the
   * event types and codes, and registers the input of the barcode scanner into the `barcode` ref when valid.
   *
   * When an Enter key is detected, it stops registering the input stream and returns the final data object
   * that was constructed. This includes the total barcode value. It also ignores Shift keys, as the scanner
   * devices sometimes fire these between characters.
   *
   * Note: Scanner devices always rapidly fire events. After a certain delay, the scanner must ignore
   * input as to not confuse them with regular keyboard typing events.
   */
  function registerScannerInput(event: Event): void {
    if (barcodeScannerInterval) {
      clearInterval(barcodeScannerInterval);
    }

    if (event instanceof KeyboardEvent && event.code === keyboard.key.enter) {
      if (barcode.value && onScanCallback) {
        onScanCallback(
          createScannedBarcodeData(barcode.value),
        );
      }

      barcode.value = '';

      return;
    }

    if (event instanceof KeyboardEvent && event.code !== keyboard.key.shift) {
      barcode.value += event.key;
    }

    barcodeScannerInterval = setInterval(() => {
      barcode.value = '';
    }, config.timeout);
  }

  /**
   * This function can be called to stop listening to scanner input.
   */
  function stopListening(): void {
    listeningActive = false;

    document.removeEventListener(keyboard.event, registerScannerInput);

    if (barcodeScannerInterval) {
      clearInterval(barcodeScannerInterval);
    }
  }

  /**
   * This function can be called to start listening to scanner input events. It requires a callback
   * to handle the data that is returned when scanning a barcode. When called, it cannot be called
   * a second time due to the check at the beginning. This prevents the DOM from becoming clogged with
   * duplicate listeners.
   */
  function listen(callback: BarcodeScannerListenerCallback): void {
    if (listeningActive) {
      stopListening();
    }

    listeningActive = true;
    onScanCallback = callback;

    document.addEventListener(keyboard.event, registerScannerInput);
  }

  /**
   * When used inside a Vue component setup script, the barcode detector will stop automatically when unmounting.
   * This prevents multiple listeners from being registered when re-rendering the component without manually
   * calling `stopListening()`.
   */
  onBeforeUnmount(() => {
    stopListening();
  });

  return { barcode, listen, stopListening };
}
