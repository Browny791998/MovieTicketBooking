interface MovieInfoGridProps {
  director?: string | null;
  writer?: string | null;
  language?: string | null;
  releaseDate?: Date | string | null;
  boxOffice?: string | null;
  awards?: string | null;
  tagline?: string | null;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
      <dt className="w-28 flex-shrink-0 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </dt>
      <dd className="text-sm text-zinc-300">{value}</dd>
    </div>
  );
}

export function MovieInfoGrid({
  director,
  writer,
  language,
  releaseDate,
  boxOffice,
  awards,
  tagline,
}: MovieInfoGridProps) {
  const rows: { label: string; value: string }[] = [];

  if (director) rows.push({ label: "Director", value: director });
  if (writer) rows.push({ label: "Writer", value: writer });
  if (language) rows.push({ label: "Language", value: language });
  if (releaseDate) {
    const date = new Date(releaseDate);
    rows.push({
      label: "Release",
      value: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    });
  }
  if (boxOffice) rows.push({ label: "Box Office", value: boxOffice });
  if (awards) rows.push({ label: "Awards", value: awards });

  if (rows.length === 0 && !tagline) return null;

  return (
    <div className="space-y-4">
      {tagline && (
        <p className="text-base italic text-zinc-400">&ldquo;{tagline}&rdquo;</p>
      )}
      {rows.length > 0 && (
        <dl className="space-y-3">
          {rows.map((row) => (
            <InfoRow key={row.label} label={row.label} value={row.value} />
          ))}
        </dl>
      )}
    </div>
  );
}
