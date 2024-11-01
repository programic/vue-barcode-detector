import { flushPromises } from '@vue/test-utils';
import useBarcodeDetector, { type ScannedBarcodeData } from '../index';

describe('the barcode detector', () => {
  it('should listen to the keydown events', async () => {
    const barcodeDetector = useBarcodeDetector();
    let barcodeValue = null;

    barcodeDetector.listen((barcodeData: ScannedBarcodeData): void => {
      barcodeValue = barcodeData.value;
    });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', code: 'a' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', code: 'd' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '4', code: '4' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '6', code: '6' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', code: 'f' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '2', code: '2' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '1', code: '1' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'h', code: 'h' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', code: 'x' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter' }));

    expect(barcodeValue).toBe('ad46f21hx');
  });

  it('should reset the values without Enter key', async () => {
    const barcodeDetector = useBarcodeDetector();
    let barcodeValue = null;

    barcodeDetector.listen((barcodeData: ScannedBarcodeData): void => {
      barcodeValue = barcodeData.value;
    });

    expect(barcodeValue).toBe(null);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', code: 'x' }));

    expect(barcodeValue).toBe(null);

    await flushPromises();

    expect(barcodeValue).toBe(null);
  });

  it('should reset data after Enter key pressed', async () => {
    const barcodeDetector = useBarcodeDetector();
    let barcodeValue = null;

    barcodeDetector.listen((barcodeData: ScannedBarcodeData): void => {
      barcodeValue = barcodeData.value;
    });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', code: 'b' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '8', code: '8' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'u', code: 'u' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', code: 'z' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', code: 'a' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter' }));

    expect(barcodeValue).not.toEqual(barcodeDetector.barcode.value);
    expect(barcodeDetector.barcode.value).toEqual('');
  });
});
