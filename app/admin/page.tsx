"use client";

import { useState } from "react";

type DateRequest = {
  id: string;
  requester_name: string;
  contact: string;
  note: string | null;
  status: string;
  created_at: string;
  request_date: string | null;
  request_time: string | null;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);

  const [requests, setRequests] = useState<DateRequest[]>([]);

  async function login() {
    if (!password) {
      alert("Şifre gir.");
      return;
    }

    const response = await fetch("/api/admin/requests", {
      headers: {
        "x-admin-password": password,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert(errorData.message || "Giriş yapılamadı.");
      return;
    }

    setIsLoggedIn(true);
    const data = await response.json();
    setRequests(data);
  }

  async function fetchRequests(currentPassword = password) {
    const response = await fetch("/api/admin/requests", {
      headers: {
        "x-admin-password": currentPassword,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert(errorData.message || "Talepler alınamadı.");
      return;
    }

    const data = await response.json();
    setRequests(data);
  }

  async function updateRequestStatus(id: string, status: string) {
    const response = await fetch("/api/admin/requests", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({
        id,
        status,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert(errorData.message || "Talep güncellenemedi.");
      return;
    }

    fetchRequests();
  }

  async function deleteRequest(id: string) {
    const response = await fetch("/api/admin/requests", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert(errorData.message || "Talep silinemedi.");
      return;
    }

    setRequestToDelete(null);
    fetchRequests();
  }

  if (!isLoggedIn) {
    return (
      <main className="adminPage">
        <form
          className="adminLoginCard"
          onSubmit={(event) => {
            event.preventDefault();
            login();
          }}
        >
          <h1>Admin Panel</h1>
          <p>Gelen planlama taleplerini yönet.</p>

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Admin şifresi"
          />

          <button type="submit">Giriş Yap</button>
        </form>
      </main>
    );
  }

  return (
    <main className="adminPage">
      <section className="adminHeader">
        <div>
          <p className="eyebrow">Yönetim paneli</p>
          <h1>Planlama Talepleri</h1>
        </div>

        <button
          className="secondaryButton"
          onClick={() => {
            fetchRequests();
          }}
        >
          Yenile
        </button>
      </section>

      <section className="adminGrid singleColumnAdminGrid">
        <div className="adminCard">
          <h2>Gelen Talepler</h2>

          <div className="list">
            {requests.length === 0 ? (
              <p className="muted">Henüz talep yok.</p>
            ) : (
              requests.map((request) => (
                <div className="requestItem" key={request.id}>
                  <div className="requestTop">
                    <strong>{request.requester_name}</strong>
                    <span className={`status ${request.status}`}>
                      {statusText(request.status)}
                    </span>
                  </div>

                  <p>
                    <strong>Tarih:</strong>{" "}
                    {request.request_date
                      ? `${formatDate(request.request_date)} - ${
                          request.request_time || "Saat yok"
                        }`
                      : "Tarih seçilmemiş"}
                  </p>

                  <p>
                    <strong>İletişim:</strong> {request.contact}
                  </p>

                  {request.note && (
                    <p>
                      <strong>Not:</strong> {request.note}
                    </p>
                  )}

                  <div className="requestActions">
                    <button
                      onClick={() =>
                        updateRequestStatus(request.id, "approved")
                      }
                    >
                      Onayla
                    </button>

                    <button
                      className="dangerButton"
                      onClick={() =>
                        updateRequestStatus(request.id, "rejected")
                      }
                    >
                      Reddet
                    </button>

                    <button
                      className="secondaryButton"
                      onClick={() =>
                        updateRequestStatus(request.id, "pending")
                      }
                    >
                      Beklemede
                    </button>
                  </div>

                  <button
                    className="deleteIconButton"
                    onClick={() => setRequestToDelete(request.id)}
                    aria-label="Talebi sil"
                    title="Talebi sil"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {requestToDelete && (
        <div className="modalOverlay" role="dialog" aria-modal="true">
          <div className="themeModal">
            <div className="modalIcon">!</div>
            <h3>Talebi sil</h3>
            <p>Bu randevu talebini silmek istiyor musun?</p>
            <div className="modalActions">
              <button
                className="modalCancelButton"
                type="button"
                onClick={() => setRequestToDelete(null)}
              >
                İptal
              </button>
              <button
                className="modalDeleteButton"
                type="button"
                onClick={() => deleteRequest(requestToDelete)}
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    weekday: "short",
  }).format(new Date(date));
}

function statusText(status: string) {
  if (status === "approved") return "Onaylandı";
  if (status === "rejected") return "Reddedildi";
  return "Beklemede";
}
