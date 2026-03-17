import Link from "next/link";
import { Film, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MovieNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 mb-6">
        <Film className="h-10 w-10 text-zinc-600" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Movie Not Found</h1>
      <p className="text-zinc-400 mb-8 max-w-sm">
        We couldn&apos;t find the movie you&apos;re looking for. It may have been removed or the link is incorrect.
      </p>
      <Link href="/movies">
        <Button className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Movies
        </Button>
      </Link>
    </div>
  );
}
