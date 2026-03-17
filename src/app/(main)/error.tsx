"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MainError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-950/30 border border-red-800/50 mb-6">
        <AlertTriangle className="h-10 w-10 text-red-400" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
      <p className="text-zinc-400 mb-8 max-w-sm">
        An unexpected error occurred. Please try again.
      </p>
      <Button onClick={reset} variant="outline">Try again</Button>
    </div>
  );
}
