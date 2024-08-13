/**
 * Copyright (c) Jesse Koerhuis 2024.
 *
 * This code was written by Jesse Koerhuis. For more information, please refer to the LICENSE file distributed with this
 * software. For more content, visit https://jessekoerhuis.nl/.
 */

import { onBeforeUnmount, ref } from 'vue';

const keyboard = {
    event: 'keydown',
    key: {
        enter: 'Enter',
        shift: 'Shift',
    },
};

const scannerConfig = {
    timeout: 100,
};

export default function useBarcodeScanner() {
    const barcode = ref ('');
    const barcodeScannerInterval = ref();
    const listeningActive = ref(false);
    const onScanCallback = ref();

    function _createScannedBarcodeData(barcodeValue) {
        const date = new Date();

        return {
            timestamp: date.getTime(),
            value: barcodeValue,
        };
    }

    function _registerScannerInput(event) {
        if (barcodeScannerInterval.value) {
            clearInterval(barcodeScannerInterval.value);
        }

        if (event instanceof KeyboardEvent && event.code === keyboard.key.enter) {
            if (barcode.value && onScanCallback.value) {
                onScanCallback.value(
                    _createScannedBarcodeData(barcode.value),
                );
            }

            barcode.value = '';

            return;
        }

        if (event instanceof KeyboardEvent && event.code !== keyboard.key.shift) {
            barcode.value += event.key;
        }

        barcodeScannerInterval.value = setInterval(() => {
            barcode.value = '';
        }, scannerConfig.timeout);
    }

    function stopListening() {
        listeningActive.value = false;

        document.removeEventListener(keyboard.event, _registerScannerInput);

        if (barcodeScannerInterval.value) {
            clearInterval(barcodeScannerInterval.value);
        }
    }

    function listen(callback) {
        if (listeningActive.value) {
            stopListening();
        }

        listeningActive.value = true;
        onScanCallback.value = callback;

        document.addEventListener(keyboard.event, _registerScannerInput);
    }

    onBeforeUnmount(() => {
        stopListening();
    });

    return { barcode, listen, stopListening };
}
