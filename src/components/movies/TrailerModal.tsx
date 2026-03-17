"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Play } from "lucide-react";

interface TrailerModalProps {
  trailerKey: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TrailerModal({ trailerKey, title, open, onOpenChange }: TrailerModalProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (open && trailerKey) {
      setSrc(
        `https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`
      );
    } else {
      const t = setTimeout(() => setSrc(null), 300);
      return () => clearTimeout(t);
    }
  }, [open, trailerKey]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl px-4 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="relative">
            <Dialog.Close className="absolute -top-10 right-0 flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors z-10">
              <X className="h-5 w-5" />
              <span className="text-sm">Close</span>
            </Dialog.Close>

            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-2xl">
              {src ? (
                <iframe
                  src={src}
                  title={`${title} Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="h-16 w-16 text-zinc-600" />
                </div>
              )}
            </div>

            <p className="mt-3 text-center text-zinc-300 text-sm font-medium">
              {title} — Official Trailer
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
