import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function checkAdmin(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  return password === process.env.ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ message: "Yetkisiz işlem." }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("date_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { message: error.message || "Talepler alınamadı." },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ message: "Yetkisiz işlem." }, { status: 401 });
  }

  const body = await request.json();
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json(
      { message: "Talep ID veya durum eksik." },
      { status: 400 }
    );
  }

  const allowedStatuses = ["pending", "approved", "rejected"];

  if (!allowedStatuses.includes(status)) {
    return NextResponse.json(
      { message: "Geçersiz durum." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("date_requests")
    .update({ status })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { message: error.message || "Talep güncellenemedi." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Talep güncellendi.",
  });
}

export async function DELETE(request: NextRequest) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ message: "Yetkisiz işlem." }, { status: 401 });
  }

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json(
      { message: "Talep ID eksik." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("date_requests")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { message: error.message || "Talep silinemedi." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Talep silindi.",
  });
}
