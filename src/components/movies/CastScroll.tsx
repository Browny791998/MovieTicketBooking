"use client";

import Image from "next/image";
import type { CastMember } from "@prisma/client";

interface CastScrollProps {
  cast: CastMember[];
}

function InitialAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-700 text-lg font-bold text-zinc-300">
      {initials}
    </div>
  );
}

function CastCard({ member }: { member: CastMember }) {
  return (
    <div className="flex w-20 flex-shrink-0 flex-col items-center gap-2">
      <div className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-zinc-700">
        {member.profileUrl ? (
          <Image
            src={member.profileUrl}
            alt={member.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <InitialAvatar name={member.name} />
        )}
      </div>
      <div className="w-full text-center">
        <p className="truncate text-xs font-medium text-white">{member.name}</p>
        {member.character && (
          <p className="truncate text-xs text-zinc-500">{member.character}</p>
        )}
        {member.job && !member.character && (
          <p className="truncate text-xs text-zinc-500">{member.job}</p>
        )}
      </div>
    </div>
  );
}

export function CastScroll({ cast }: CastScrollProps) {
  if (!cast || cast.length === 0) return null;

  const actors = cast.filter((m) => m.department === "Acting");
  const crew = cast.filter((m) => m.department !== "Acting");

  return (
    <div className="space-y-6">
      {actors.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Cast
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {actors.map((member) => (
              <CastCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      )}
      {crew.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Crew
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {crew.map((member) => (
              <CastCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
