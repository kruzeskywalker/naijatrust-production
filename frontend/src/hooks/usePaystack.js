import { useEffect } from 'react';

/**
 * Custom hook for Paystack payment integration
 * Compatible with React 19
 */
const usePaystack = () => {
    useEffect(() => {
        // Verify Paystack script is loaded
        if (!window.PaystackPop) {
            console.error('Paystack script not loaded');
        }
    }, []);

    const initializePayment = ({
        email,
        amount,
        reference,
        accessCode,
        onSuccess,
        onClose,
        metadata = {},
        currency = 'NGN'
    }) => {
        const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

        console.log('usePaystack initializePayment called with:', { email, amount, reference, accessCode });
        console.log('Paystack public key available:', !!publicKey);

        if (!publicKey) {
            console.error('Paystack public key not found in environment variables');
            alert('Payment configuration error. Please contact support.');
            return;
        }

        if (!window.PaystackPop) {
            console.error('Paystack library not loaded (window.PaystackPop is undefined)');
            alert('Payment system not loaded. Please refresh the page and try again.');
            return;
        }

        console.log('Setting up Paystack handler...');

        try {
            const handler = window.PaystackPop.setup({
                key: publicKey,
                email,
                amount: amount * 100, // Convert to kobo
                currency,
                ref: reference,
                access_code: accessCode, // If provided, Paystack uses the initialized transaction
                metadata,
                onClose: () => {
                    console.log('Payment window closed');
                    onClose && onClose();
                },
                callback: (response) => {
                    console.log('Payment successful:', response);
                    onSuccess && onSuccess(response);
                }
            });

            console.log('Handler created, opening popup...');
            handler.openIframe();
            console.log('handler.openIframe() called');
        } catch (error) {
            console.error('Error setting up Paystack:', error);
            alert('Failed to open payment window: ' + error.message);
        }
    };

    return { initializePayment };
};

export default usePaystack;
