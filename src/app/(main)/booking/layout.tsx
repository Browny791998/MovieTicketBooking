import { CheckoutSteps } from "@/components/booking/CheckoutSteps";

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="border-b border-zinc-800 bg-zinc-900/60 py-4">
        <div className="mx-auto max-w-lg px-4">
          <CheckoutSteps />
        </div>
      </div>
      {children}
    </div>
  );
}
