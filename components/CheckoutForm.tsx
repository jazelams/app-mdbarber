
"use client";

import {
    PaymentElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";

export default function CheckoutForm({ amount, onSuccess }: { amount: number, onSuccess: (paymentId: string) => void }) {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js hasn't yet loaded.
            return;
        }

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Make sure to change this to your payment completion page if needed,
                // but since we handle it inline, we might not redirect if we capture it.
                // However, for payment_intent confirmation, sometimes redirect is required.
                // We will try redirect: 'if_required'.
                return_url: window.location.origin,
            },
            redirect: "if_required",
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message || "Ocurrió un error inesperado");
            } else {
                setMessage("Ocurrió un error inesperado al procesar el pago.");
            }
            setIsLoading(false);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            // Payment succeeded!
            onSuccess(paymentIntent.id);
            setIsLoading(false);
        } else {
            setMessage("El pago no pudo ser confirmado. Intenta de nuevo.");
            setIsLoading(false);
        }
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                <h3 className="text-[#D4AF37] font-bold mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Pago Seguro con Tarjeta
                </h3>
                <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
            </div>

            {message && (
                <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg text-red-400 text-sm font-medium">
                    {message}
                </div>
            )}

            <button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full py-4 bg-[#D4AF37] text-black font-bold text-lg rounded-xl hover:bg-[#FCC200] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        PROCESANDO PAGO...
                    </>
                ) : (
                    `PAGAR $${amount} Y RESERVAR`
                )}
            </button>
        </form>
    );
}
