/**
 * Razorpay Payment Gateway Service
 * Handles script loading, checkout modal initialization, and test-mode helpers
 */

import { RazorpayCheckoutOptions } from '../types/payment';

export const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

export const RAZORPAY_TEST_INFO = {
  cardNumber: '4111 1111 1111 1111',
  cardExpiry: '12/28',
  cardCvv: '123',
  testUpi: 'success@razorpay',
  testOtp: '123456',
};

let scriptLoadingPromise: Promise<boolean> | null = null;

export const loadRazorpayScript = (): Promise<boolean> => {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve) => {
    // Check if already in DOM
    const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`);
    if (existingScript) {
      if (window.Razorpay) {
        resolve(true);
      } else {
        existingScript.addEventListener('load', () => resolve(true));
        existingScript.addEventListener('error', () => resolve(false));
      }
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      console.warn('Failed to load Razorpay checkout.js script from CDN.');
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return scriptLoadingPromise;
};

export const launchRazorpayCheckout = async (options: RazorpayCheckoutOptions): Promise<void> => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !window.Razorpay) {
    throw new Error('Razorpay SDK could not be loaded. Please check your internet connection or use Simulated Instant Gateway.');
  }

  const rzpInstance = new window.Razorpay(options);
  rzpInstance.open();
};
