"use client";

import { useState } from "react";

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const HOURS = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, "0")
);
const MINUTES = Array.from({ length: 12 }, (_, index) =>
  String(index * 5).padStart(2, "0")
);

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  const calendarDays = getCalendarDays(calendarMonth);
  const selectedDateLabel = selectedDate
    ? `📅 ${formatDisplayDate(selectedDate)}`
    : "📅 Tarih seç";
  const selectedTimeLabel = selectedTime ? `🕒 ${selectedTime}` : "🕒 Saat seç";
  const [selectedHour = "", selectedMinute = ""] = selectedTime.split(":");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!selectedDate || !selectedTime || !requesterName || !contact) {
      setErrorMessage("Lütfen tarih, saat, ad ve e-posta adresini doldur.");
      return;
    }

    if (!isValidEmail(contact)) {
      setErrorMessage("Lütfen geçerli bir e-posta adresi gir.");
      return;
    }

    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    const response = await fetch("/api/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestDate: selectedDate,
        requestTime: selectedTime,
        requesterName,
        contact,
        note,
      }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setErrorMessage(data.message || "Bir hata oluştu.");
      return;
    }

    setSuccessMessage(
      "Talebin başarıyla alındı. Uygunluk durumuna göre sana dönüş yapılacaktır."
    );

    setSelectedDate("");
    setSelectedTime("");
    setRequesterName("");
    setContact("");
    setNote("");
    setIsCalendarOpen(false);
    setIsTimePickerOpen(false);
  }

  function changeCalendarMonth(offset: number) {
    setCalendarMonth(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + offset, 1)
    );
  }

  function selectDate(date: Date) {
    setSelectedDate(formatDateValue(date));
    setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    setIsCalendarOpen(false);
  }

  function selectHour(hour: string) {
    setSelectedTime(`${hour}:${selectedMinute || "00"}`);
  }

  function selectMinute(minute: string) {
    setSelectedTime(`${selectedHour || "00"}:${minute}`);
    setIsTimePickerOpen(false);
  }

  return (
    <main className="page photoPage">
      <div className="backgroundPhotos">
        <div className="photoLayer photoOne" />
        <div className="photoLayer photoTwo" />
        <div className="photoLayer photoThree" />
        <div className="photoOverlay" />
      </div>

      <section className="bookingIntro">
        <p className="eyebrow">PRIVATE REQUEST</p>
        <p className="introText">
          Sana uygun tarih ve saati seçerek planlama talebi oluşturabilirsin.
        </p>
      </section>

      <section className="bookingCard floatingCard">
        <div className="sectionHeader">
          <h2>Planlama Talebi</h2>
          <p>Talebin onaylandıktan sonra kesinleşir.</p>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <div className="calendarField">
            <span>Tarih</span>
            <button
              className="datePickerTrigger"
              type="button"
              onClick={() => {
                setIsCalendarOpen((isOpen) => !isOpen);
                setIsTimePickerOpen(false);
              }}
            >
              <span>{selectedDateLabel}</span>
              <span className="datePickerIcon">⌄</span>
            </button>

            {isCalendarOpen && (
              <div className="customCalendar">
                <div className="calendarHeader">
                  <button type="button" onClick={() => changeCalendarMonth(-1)}>
                    ‹
                  </button>
                  <strong>{formatCalendarTitle(calendarMonth)}</strong>
                  <button type="button" onClick={() => changeCalendarMonth(1)}>
                    ›
                  </button>
                </div>

                <div className="calendarWeekdays">
                  {WEEKDAYS.map((weekday) => (
                    <span key={weekday}>{weekday}</span>
                  ))}
                </div>

                <div className="calendarGrid">
                  {calendarDays.map(({ date, isCurrentMonth }) => {
                    const dateValue = formatDateValue(date);
                    const isSelected = selectedDate === dateValue;

                    return (
                      <button
                        className={[
                          "calendarDay",
                          !isCurrentMonth ? "mutedDay" : "",
                          isSelected ? "selectedDay" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        key={dateValue}
                        type="button"
                        onClick={() => selectDate(date)}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="timeField">
            <span>Saat</span>
            <button
              className="timePickerTrigger"
              type="button"
              onClick={() => {
                setIsTimePickerOpen((isOpen) => !isOpen);
                setIsCalendarOpen(false);
              }}
            >
              <span>{selectedTimeLabel}</span>
              <span className="timePickerIcon">⌄</span>
            </button>

            {isTimePickerOpen && (
              <div className="customTimePicker">
                <div className="timeColumn">
                  <strong>Saat</strong>
                  <div className="timeOptions">
                    {HOURS.map((hour) => (
                      <button
                        className={[
                          "timeOption",
                          selectedHour === hour ? "selectedTimeOption" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        key={hour}
                        type="button"
                        onClick={() => selectHour(hour)}
                      >
                        {hour}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="timeColumn">
                  <strong>Dakika</strong>
                  <div className="timeOptions">
                    {MINUTES.map((minute) => (
                      <button
                        className={[
                          "timeOption",
                          selectedMinute === minute ? "selectedTimeOption" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        key={minute}
                        type="button"
                        onClick={() => selectMinute(minute)}
                      >
                        {minute}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <label>
            Adın
            <input
              value={requesterName}
              onChange={(event) => setRequesterName(event.target.value)}
              placeholder="Adını yaz"
            />
          </label>

          <label>
            E-posta adresin
            <input
              type="email"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              placeholder="ornek@mail.com"
            />
          </label>

          <label>
            Kısa not
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="İstersen kısa bir not bırak"
              rows={4}
            />
          </label>

          <button className="submitButton" disabled={loading} type="submit">
            {loading ? "Gönderiliyor..." : "Planlama Talebi Gönder"}
          </button>
        </form>
      </section>

      <section className="scrollSection">
        <div className="textBlock">
          <p className="eyebrow">PRIVATE MOMENT</p>
          <h2>Seçilen zaman yalnızca bir talep olarak iletilir.</h2>
          <p>
            Uygunluk durumuna göre dönüş yapılır. Böylece planlama daha
            kontrollü ve kişisel kalır.
          </p>
        </div>
      </section>

      {errorMessage && (
        <div className="modalOverlay" role="dialog" aria-modal="true">
          <div className="themeModal">
            <div className="modalIcon">!</div>
            <h3>Eksik bilgi</h3>
            <p>{errorMessage}</p>
            <button type="button" onClick={() => setErrorMessage("")}>
              Tamam
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="modalOverlay" role="dialog" aria-modal="true">
          <div className="themeModal successModal">
            <div className="modalIcon successIcon">✓</div>
            <h3>Talep alındı</h3>
            <p>{successMessage}</p>
            <button type="button" onClick={() => setSuccessMessage("")}>
              Tamam
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function getCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const mondayBasedStart = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(year, month, 1 - mondayBasedStart);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    return {
      date,
      isCurrentMonth: date.getMonth() === month,
    };
  });
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    weekday: "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function formatCalendarTitle(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
