import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export async function requireAuth(_req?: NextRequest) {
  const session = await auth();
  if (!session) {
    throw apiError("Unauthorized", 401);
  }
  return session;
}

export async function requireAdmin(_req?: NextRequest) {
  const session = await auth();
  if (!session) {
    throw apiError("Unauthorized", 401);
  }
  if (session.user.role !== "ADMIN") {
    throw apiError("Forbidden", 403);
  }
  return session;
}
