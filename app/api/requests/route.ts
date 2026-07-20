import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { requestDate, requestTime, meetingType, requesterName, contact, note } =
    body;

  if (!requestDate || !requestTime || !meetingType || !requesterName || !contact) {
    return NextResponse.json(
      {
        message:
          "Lütfen tarih, saat, buluşma türü, ad ve e-posta adresini doldur.",
      },
      { status: 400 }
    );
  }

  if (!isValidEmail(contact)) {
    return NextResponse.json(
      { message: "Lütfen geçerli bir e-posta adresi gir." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin.from("date_requests").insert({
    request_date: requestDate,
    request_time: requestTime,
    meeting_type: meetingType,
    requester_name: requesterName,
    contact,
    note,
    status: "pending",
  });

  if (error) {
    return NextResponse.json(
      { message: error.message || "Talep kaydedilemedi." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Talebin başarıyla alındı.",
  });
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
