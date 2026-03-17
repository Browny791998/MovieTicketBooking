"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle2, XCircle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Status {
  enriched: boolean;
  enrichedAt: string | null;
  tmdbId: number | null;
  imdbId: string | null;
  castCount: number;
}

interface EnrichmentStatusProps {
  movieId: string;
  onEnriched?: () => void;
}

export function EnrichmentStatus({ movieId, onEnriched }: EnrichmentStatusProps) {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`/api/admin/movies/enrich/${movieId}`);
      setStatus(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [movieId]);

  const handleEnrich = async () => {
    setEnriching(true);
    try {
      await axios.post(`/api/admin/movies/enrich/${movieId}`);
      await fetchStatus();
      onEnriched?.();
    } catch {
      // ignore
    } finally {
      setEnriching(false);
    }
  };

  if (loading) {
    return <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />;
  }

  if (!status) return null;

  return (
    <div className="flex items-center gap-3">
      {status.enriched ? (
        <>
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <span className="text-xs text-zinc-400">
            TMDB:{status.tmdbId} · {status.castCount} cast
            {status.enrichedAt && (
              <> · {new Date(status.enrichedAt).toLocaleDateString()}</>
            )}
          </span>
        </>
      ) : (
        <>
          <XCircle className="h-4 w-4 text-zinc-600" />
          <span className="text-xs text-zinc-500">Not enriched</span>
        </>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleEnrich}
        disabled={enriching}
        className="h-7 gap-1 text-yellow-400 hover:text-yellow-300"
      >
        {enriching ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Sparkles className="h-3 w-3" />
        )}
        {status.enriched ? "Re-enrich" : "Enrich"}
      </Button>
    </div>
  );
}
