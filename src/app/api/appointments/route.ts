import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@cvx/_generated/api";
import { MEDICAL_DISCLAIMER } from "@/lib/medicalDisclaimer";
import type { Doc } from "@cvx/_generated/dataModel";

export const runtime = "nodejs";

type Appt = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  preferredDate: string;
  notes?: string;
  createdAt: string;
};

function mapDoc(doc: Doc<"appointments">): Appt {
  return {
    id: doc._id,
    name: doc.guestName ?? "",
    email: doc.guestEmail ?? "",
    phone: doc.guestPhone,
    department: doc.department ?? "",
    preferredDate: doc.preferredDate ?? "",
    notes: doc.notes,
    createdAt: new Date(doc._creationTime).toISOString(),
  };
}

function getClient(): ConvexHttpClient | null {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return null;
  return new ConvexHttpClient(url);
}

export async function GET() {
  const client = getClient();
  if (!client) {
    return NextResponse.json(
      {
        error: "NEXT_PUBLIC_CONVEX_URL is not configured",
        disclaimer: MEDICAL_DISCLAIMER,
      },
      { status: 503 }
    );
  }
  try {
    const rows = await client.query(api.guestAppointments.listRecent, {
      limit: 100,
    });
    const appointments = (rows as Doc<"appointments">[]).map(mapDoc);
    return NextResponse.json({ appointments, disclaimer: MEDICAL_DISCLAIMER });
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Failed to load appointments",
        disclaimer: MEDICAL_DISCLAIMER,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const client = getClient();
  if (!client) {
    return NextResponse.json(
      {
        error: "NEXT_PUBLIC_CONVEX_URL is not configured",
        disclaimer: MEDICAL_DISCLAIMER,
      },
      { status: 503 }
    );
  }
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON", disclaimer: MEDICAL_DISCLAIMER },
      { status: 400 }
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const department =
    typeof body.department === "string" ? body.department.trim() : "";
  const preferredDate =
    typeof body.preferredDate === "string" ? body.preferredDate.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : undefined;
  const notes = typeof body.notes === "string" ? body.notes.trim() : undefined;

  if (!name || !email || !department || !preferredDate) {
    return NextResponse.json(
      {
        error: "name, email, department, and preferredDate are required",
        disclaimer: MEDICAL_DISCLAIMER,
      },
      { status: 422 }
    );
  }

  try {
    const created = await client.mutation(api.guestAppointments.createGuest, {
      name,
      email,
      phone,
      department,
      preferredDate,
      notes,
    });
    return NextResponse.json(
      {
        appointment: mapDoc(created as Doc<"appointments">),
        disclaimer: MEDICAL_DISCLAIMER,
      },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Failed to save appointment",
        disclaimer: MEDICAL_DISCLAIMER,
      },
      { status: 500 }
    );
  }
}
