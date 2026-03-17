"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Movie, Hall, Theater } from "@/types";

const showtimeSchema = z.object({
  movieId: z.string().min(1, "Movie is required"),
  hallId: z.string().min(1, "Hall is required"),
  startTime: z.string().min(1, "Start time is required"),
  basePrice: z.coerce.number().min(1, "Price must be at least $1"),
});

type ShowtimeFormData = z.infer<typeof showtimeSchema>;

interface ShowtimeFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ShowtimeForm({ onSuccess, onCancel }: ShowtimeFormProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [halls, setHalls] = useState<(Hall & { theater: Theater })[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ShowtimeFormData>({
    resolver: zodResolver(showtimeSchema),
    defaultValues: { basePrice: 12 },
  });

  useEffect(() => {
    axios.get("/api/movies").then((r) => setMovies(r.data));
    axios.get("/api/halls").then((r) => setHalls(r.data)).catch(() => {});
  }, []);

  const onSubmit = async (data: ShowtimeFormData) => {
    setError(null);
    try {
      await axios.post("/api/showtimes", data);
      onSuccess();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error ?? "Failed to create showtime");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Movie</Label>
        <Select onValueChange={(v) => setValue("movieId", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a movie" />
          </SelectTrigger>
          <SelectContent>
            {movies.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.movieId && <p className="text-xs text-red-400">{errors.movieId.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Hall</Label>
        <Select onValueChange={(v) => setValue("hallId", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a hall" />
          </SelectTrigger>
          <SelectContent>
            {halls.map((h) => (
              <SelectItem key={h.id} value={h.id}>
                {h.theater.name} — {h.name} ({h.hallType})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.hallId && <p className="text-xs text-red-400">{errors.hallId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Start Time</Label>
          <Input
            {...register("startTime")}
            type="datetime-local"
          />
          {errors.startTime && <p className="text-xs text-red-400">{errors.startTime.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Base Price ($)</Label>
          <Input {...register("basePrice")} type="number" step="0.01" />
          {errors.basePrice && <p className="text-xs text-red-400">{errors.basePrice.message}</p>}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-950/50 border border-red-800 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Schedule Showtime"}
        </Button>
      </div>
    </form>
  );
}
