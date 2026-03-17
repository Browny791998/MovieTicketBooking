import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { code, description, type, value, scope, minAmount, maxUses, expiresAt, active } = body;

  const promo = await prisma.promoCode.update({
    where: { id: params.id },
    data: {
      ...(code && { code: code.trim().toUpperCase() }),
      ...(description && { description: description.trim() }),
      ...(type && { type }),
      ...(value !== undefined && { value }),
      ...(scope && { scope }),
      ...(minAmount !== undefined && { minAmount }),
      ...(maxUses !== undefined && { maxUses }),
      ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
      ...(active !== undefined && { active }),
    },
  });

  return NextResponse.json(promo);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.promoCode.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
