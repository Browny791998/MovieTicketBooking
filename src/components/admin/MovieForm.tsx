"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Movie } from "@/types";
import { useState } from "react";
import axios from "axios";
import { Sparkles, Loader2 } from "lucide-react";

const movieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  genre: z.string().min(1, "Genre is required"),
  language: z.string().min(1, "Language is required"),
  durationMins: z.coerce.number().min(1),
  rating: z.string().min(1, "Rating is required"),
  posterUrl: z.string().url("Must be a valid URL"),
  releaseDate: z.string().min(1, "Release date is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  tmdbId: z.coerce.number().optional().nullable(),
});

type MovieFormData = z.infer<typeof movieSchema>;

interface MovieFormProps {
  movie?: Movie;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MovieForm({ movie, onSuccess, onCancel }: MovieFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [autoDetecting, setAutoDetecting] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MovieFormData>({
    resolver: zodResolver(movieSchema),
    defaultValues: movie
      ? {
          title: movie.title,
          genre: movie.genre,
          language: movie.language,
          durationMins: movie.durationMins,
          rating: movie.rating,
          posterUrl: movie.posterUrl,
          releaseDate: new Date(movie.releaseDate).toISOString().split("T")[0],
          description: movie.description,
          tmdbId: (movie as Movie & { tmdbId?: number | null }).tmdbId ?? undefined,
        }
      : { language: "English", rating: "PG-13" },
  });

  const title = watch("title");
  const releaseDate = watch("releaseDate");

  const handleAutoDetect = async () => {
    if (!title) return;
    setAutoDetecting(true);
    setError(null);
    try {
      const year = releaseDate ? new Date(releaseDate).getFullYear() : undefined;
      const params = new URLSearchParams({ title });
      if (year) params.set("year", String(year));
      const res = await axios.get(`/api/admin/movies/enrich/search?${params}`);
      const data = res.data;
      if (data.tmdbId) setValue("tmdbId", data.tmdbId);
      if (data.posterUrl) setValue("posterUrl", data.posterUrl);
      if (data.description && !watch("description")) setValue("description", data.description);
      if (data.durationMins && !watch("durationMins")) setValue("durationMins", data.durationMins);
    } catch {
      setError("Could not auto-detect movie. Check TMDB_API_KEY.");
    } finally {
      setAutoDetecting(false);
    }
  };

  const onSubmit = async (data: MovieFormData) => {
    setError(null);
    try {
      if (movie) {
        await axios.put(`/api/movies/${movie.id}`, data);
      } else {
        await axios.post("/api/movies", data);
      }
      onSuccess();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error ?? "Failed to save movie");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Title + Auto-detect */}
        <div className="col-span-2 space-y-1.5">
          <Label>Title</Label>
          <div className="flex gap-2">
            <Input {...register("title")} placeholder="Movie title" className="flex-1" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAutoDetect}
              disabled={autoDetecting || !title}
              className="gap-1.5 border-yellow-600/50 text-yellow-400 hover:bg-yellow-600/10 whitespace-nowrap"
            >
              {autoDetecting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              Auto-detect
            </Button>
          </div>
          {errors.title && (
            <p className="text-xs text-red-400">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Genre</Label>
          <Input {...register("genre")} placeholder="Action, Drama..." />
          {errors.genre && (
            <p className="text-xs text-red-400">{errors.genre.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Language</Label>
          <Input {...register("language")} />
          {errors.language && (
            <p className="text-xs text-red-400">{errors.language.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Duration (minutes)</Label>
          <Input {...register("durationMins")} type="number" placeholder="120" />
          {errors.durationMins && (
            <p className="text-xs text-red-400">{errors.durationMins.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Rating</Label>
          <Select
            onValueChange={(v) => setValue("rating", v)}
            defaultValue={watch("rating")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select rating" />
            </SelectTrigger>
            <SelectContent>
              {["G", "PG", "PG-13", "R", "NC-17"].map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Release Date</Label>
          <Input {...register("releaseDate")} type="date" />
          {errors.releaseDate && (
            <p className="text-xs text-red-400">{errors.releaseDate.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>TMDB ID <span className="text-zinc-500 font-normal">(optional)</span></Label>
          <Input {...register("tmdbId")} type="number" placeholder="e.g. 550" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Poster URL</Label>
          <Input {...register("posterUrl")} placeholder="https://..." />
          {errors.posterUrl && (
            <p className="text-xs text-red-400">{errors.posterUrl.message}</p>
          )}
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Description</Label>
          <Textarea
            {...register("description")}
            rows={3}
            placeholder="Movie description..."
          />
          {errors.description && (
            <p className="text-xs text-red-400">{errors.description.message}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-950/50 border border-red-800 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : movie ? "Update Movie" : "Add Movie"}
        </Button>
      </div>
    </form>
  );
}
