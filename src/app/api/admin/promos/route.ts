import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const VALID_TYPES = ["PERCENTAGE", "FIXED"] as const;
const VALID_SCOPES = ["ALL", "IMAX", "FOURDX", "STANDARD"] as const;

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const promos = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(promos);
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code, description, type, value, scope, minAmount, maxUses, expiresAt } = await req.json();

  if (!code?.trim() || !description?.trim() || !type || value === undefined) {
    return NextResponse.json({ error: "code, description, type, and value are required" }, { status: 400 });
  }
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid type. Use PERCENTAGE or FIXED" }, { status: 400 });
  }
  if (type === "PERCENTAGE" && (value <= 0 || value > 100)) {
    return NextResponse.json({ error: "Percentage must be between 1 and 100" }, { status: 400 });
  }
  if (type === "FIXED" && value <= 0) {
    return NextResponse.json({ error: "Fixed discount must be greater than 0" }, { status: 400 });
  }

  const resolvedScope = VALID_SCOPES.includes(scope) ? scope : "ALL";

  const promo = await prisma.promoCode.create({
    data: {
      code: code.trim().toUpperCase(),
      description: description.trim(),
      type,
      value,
      scope: resolvedScope,
      minAmount: minAmount ?? 0,
      maxUses: maxUses ?? null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  return NextResponse.json(promo, { status: 201 });
}
