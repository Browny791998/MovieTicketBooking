export interface EmailContext {
  recipientName: string;
  recipientEmail: string;
  bookingRef: string;
  movieTitle: string;
  moviePosterUrl: string;
  theaterName: string;
  theaterCity: string;
  hallName: string;
  hallType: string;
  showDate: string;
  showTime: string;
  seatList: string;
  seatCount: number;
  totalAmount: string;
  paymentDate: string;
  appUrl: string;
  profileUrl: string;
  supportEmail: string;
  seats?: { label: string; type: string; price: string }[];
}

const C = {
  bg: "#09090b",
  cardBg: "#18181b",
  accent: "#dc2626",
  accentLight: "#f87171",
  text: "#ffffff",
  textMuted: "#a1a1aa",
  border: "#27272a",
  success: "#22c55e",
  danger: "#ef4444",
  rowAlt: "#27272a",
};

function emailWrapper(content: string, appUrl: string, supportEmail: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Dat Shin Cinema</title>
</head>
<body style="margin:0;padding:0;background:${C.bg};font-family:Inter,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center" style="padding:40px 16px">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%">
        <!-- HEADER -->
        <tr>
          <td style="background:${C.accent};padding:20px 32px;border-radius:12px 12px 0 0">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <span style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px">DAT<span style="opacity:0.75">SHIN</span></span>
                  <span style="color:rgba(255,255,255,0.7);font-size:13px;margin-left:10px">Cinema</span>
                </td>
                <td align="right">
                  <span style="color:rgba(255,255,255,0.6);font-size:11px;letter-spacing:2px;text-transform:uppercase">Your Ticket</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- CONTENT -->
        <tr>
          <td style="background:${C.cardBg};padding:32px;border-radius:0 0 12px 12px;border:1px solid ${C.border};border-top:none">
            ${content}
          </td>
        </tr>
        <!-- FOOTER -->
        <tr>
          <td style="padding:24px 0;text-align:center">
            <p style="color:#52525b;font-size:12px;margin:0 0 6px">
              Dat Shin Cinema &middot; Yangon, Myanmar
            </p>
            <p style="color:#52525b;font-size:12px;margin:0">
              <a href="${appUrl}" style="color:${C.accent};text-decoration:none">Visit Dat Shin</a>
              &nbsp;&middot;&nbsp;
              <a href="mailto:${supportEmail}" style="color:${C.accent};text-decoration:none">Contact Support</a>
              &nbsp;&middot;&nbsp;
              <a href="${appUrl}/unsubscribe" style="color:#52525b;text-decoration:none">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function bookingConfirmationTemplate(ctx: EmailContext, qrCid: string): string {
  const seatRows = (ctx.seats ?? [])
    .map((s, i) => `
      <tr style="background:${i % 2 === 0 ? C.cardBg : C.rowAlt}">
        <td style="padding:10px 14px;color:${C.text};font-size:13px">${s.label}</td>
        <td style="padding:10px 14px;color:${C.textMuted};font-size:13px">${s.type}</td>
        <td style="padding:10px 14px;color:${C.text};font-size:13px;text-align:right">${s.price}</td>
      </tr>`)
    .join("");

  const hallLabel = ctx.hallType === "IMAX" ? "IMAX" : ctx.hallType === "FOURDX" ? "4DX" : "Standard";

  const content = `
    <!-- HERO -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px">
      <tr>
        <td align="center">
          <div style="display:inline-block;width:56px;height:56px;border-radius:50%;background:rgba(34,197,94,0.15);border:2px solid rgba(34,197,94,0.4);text-align:center;line-height:56px;font-size:28px;margin-bottom:16px">✓</div>
          <h1 style="margin:8px 0 6px;color:${C.text};font-size:26px;font-weight:800">Booking Confirmed!</h1>
          <p style="margin:0;color:${C.textMuted};font-size:15px">Hi ${ctx.recipientName}, your seats are booked.</p>
        </td>
      </tr>
    </table>

    <!-- MOVIE CARD -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.rowAlt};border-radius:10px;margin-bottom:24px;overflow:hidden">
      <tr>
        <td width="120" style="padding:16px;vertical-align:top">
          <img src="${ctx.moviePosterUrl}" alt="${ctx.movieTitle}" width="100" style="border-radius:6px;display:block" />
        </td>
        <td style="padding:16px 16px 16px 0;vertical-align:top">
          <p style="margin:0 0 6px;color:${C.text};font-size:18px;font-weight:700;line-height:1.3">${ctx.movieTitle}</p>
          <p style="margin:0 0 4px;color:${C.accent};font-size:14px;font-weight:600">${ctx.showDate}</p>
          <p style="margin:0 0 10px;color:${C.text};font-size:20px;font-weight:800">${ctx.showTime}</p>
          <p style="margin:0 0 4px;color:${C.textMuted};font-size:13px">${ctx.hallName} &mdash; ${ctx.theaterName}</p>
          <p style="margin:0;color:${C.textMuted};font-size:13px">${ctx.theaterCity}</p>
          <div style="margin-top:10px">
            <span style="display:inline-block;background:rgba(220,38,38,0.15);color:${C.accent};border:1px solid rgba(220,38,38,0.3);border-radius:4px;padding:2px 8px;font-size:11px;font-weight:600;margin-right:4px">${hallLabel}</span>
          </div>
        </td>
      </tr>
    </table>

    <!-- BOOKING DETAILS -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${C.border};border-radius:10px;margin-bottom:24px;overflow:hidden">
      <tr style="background:${C.rowAlt}">
        <td style="padding:11px 16px;color:${C.textMuted};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;width:45%">Booking Reference</td>
        <td style="padding:11px 16px;font-family:monospace;color:${C.accent};font-size:14px;font-weight:700">${ctx.bookingRef}</td>
      </tr>
      <tr>
        <td style="padding:11px 16px;color:${C.textMuted};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid ${C.border}">Seats</td>
        <td style="padding:11px 16px;color:${C.text};font-size:14px;border-top:1px solid ${C.border}">${ctx.seatList} (${ctx.seatCount} seat${ctx.seatCount !== 1 ? "s" : ""})</td>
      </tr>
      <tr style="background:${C.rowAlt}">
        <td style="padding:11px 16px;color:${C.textMuted};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid ${C.border}">Hall</td>
        <td style="padding:11px 16px;color:${C.text};font-size:14px;border-top:1px solid ${C.border}">${ctx.hallName} &mdash; ${hallLabel}</td>
      </tr>
      <tr>
        <td style="padding:11px 16px;color:${C.textMuted};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid ${C.border}">Theater</td>
        <td style="padding:11px 16px;color:${C.text};font-size:14px;border-top:1px solid ${C.border}">${ctx.theaterName}, ${ctx.theaterCity}</td>
      </tr>
      <tr style="background:${C.rowAlt}">
        <td style="padding:11px 16px;color:${C.textMuted};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid ${C.border}">Total Paid</td>
        <td style="padding:11px 16px;color:${C.text};font-size:15px;font-weight:700;border-top:1px solid ${C.border}">${ctx.totalAmount}</td>
      </tr>
      <tr>
        <td style="padding:11px 16px;color:${C.textMuted};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid ${C.border}">Payment Date</td>
        <td style="padding:11px 16px;color:${C.textMuted};font-size:13px;border-top:1px solid ${C.border}">${ctx.paymentDate}</td>
      </tr>
    </table>

    <!-- QR CODE -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px">
      <tr>
        <td align="center">
          <p style="margin:0 0 6px;color:${C.text};font-size:16px;font-weight:600">Your Entry QR Code</p>
          <p style="margin:0 0 16px;color:${C.textMuted};font-size:13px">Show this at the theater entrance</p>
          <div style="display:inline-block;background:#fff;padding:12px;border-radius:10px;border:1px solid ${C.border}">
            <img src="cid:${qrCid}" alt="Entry QR Code" width="180" height="180" style="display:block" />
          </div>
          <p style="margin:10px 0 0;color:#52525b;font-size:11px">Do not share this QR code with others</p>
        </td>
      </tr>
    </table>

    ${seatRows ? `
    <!-- SEAT BREAKDOWN -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${C.border};border-radius:10px;margin-bottom:24px;overflow:hidden">
      <tr style="background:rgba(220,38,38,0.08)">
        <th style="padding:10px 14px;color:${C.textMuted};font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;text-align:left;border-bottom:1px solid ${C.border}">Seat</th>
        <th style="padding:10px 14px;color:${C.textMuted};font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;text-align:left;border-bottom:1px solid ${C.border}">Type</th>
        <th style="padding:10px 14px;color:${C.textMuted};font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;text-align:right;border-bottom:1px solid ${C.border}">Price</th>
      </tr>
      ${seatRows}
      <tr style="background:rgba(220,38,38,0.12)">
        <td colspan="2" style="padding:12px 14px;color:${C.text};font-size:14px;font-weight:700;border-top:1px solid ${C.border}">Total</td>
        <td style="padding:12px 14px;color:${C.text};font-size:14px;font-weight:700;text-align:right;border-top:1px solid ${C.border}">${ctx.totalAmount}</td>
      </tr>
    </table>
    ` : ""}

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px">
      <tr>
        <td align="center">
          <a href="${ctx.profileUrl}" style="display:inline-block;background:${C.accent};color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:13px 36px;border-radius:8px">View Your Tickets</a>
        </td>
      </tr>
    </table>

    <!-- HELP -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${C.border};padding-top:20px">
      <tr>
        <td>
          <p style="margin:0 0 6px;color:${C.textMuted};font-size:13px">
            Need to cancel? You can cancel up to 30 minutes before showtime from your 
            <a href="${ctx.profileUrl}" style="color:${C.accent};text-decoration:none">profile page</a>.
          </p>
          <p style="margin:0;color:#52525b;font-size:12px">
            Questions? Email us at <a href="mailto:${ctx.supportEmail}" style="color:${C.accent};text-decoration:none">${ctx.supportEmail}</a>
          </p>
        </td>
      </tr>
    </table>
  `;

  return emailWrapper(content, ctx.appUrl, ctx.supportEmail);
}

export function cancellationTemplate(ctx: EmailContext): string {
  const content = `
    <!-- HERO -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px">
      <tr>
        <td align="center">
          <div style="display:inline-block;width:56px;height:56px;border-radius:50%;background:rgba(239,68,68,0.15);border:2px solid rgba(239,68,68,0.4);text-align:center;line-height:56px;font-size:26px;margin-bottom:16px">✕</div>
          <h1 style="margin:8px 0 6px;color:${C.text};font-size:26px;font-weight:800">Booking Cancelled</h1>
          <p style="margin:0;color:${C.textMuted};font-size:15px">Hi ${ctx.recipientName}, your booking has been cancelled.</p>
        </td>
      </tr>
    </table>

    <!-- DETAILS -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${C.border};border-radius:10px;margin-bottom:24px;overflow:hidden">
      <tr style="background:${C.rowAlt}">
        <td style="padding:11px 16px;color:${C.textMuted};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;width:45%">Booking Reference</td>
        <td style="padding:11px 16px;font-family:monospace;color:#f87171;font-size:14px;font-weight:700">${ctx.bookingRef}</td>
      </tr>
      <tr>
        <td style="padding:11px 16px;color:${C.textMuted};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid ${C.border}">Movie</td>
        <td style="padding:11px 16px;color:${C.text};font-size:14px;border-top:1px solid ${C.border}">${ctx.movieTitle}</td>
      </tr>
      <tr style="background:${C.rowAlt}">
        <td style="padding:11px 16px;color:${C.textMuted};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid ${C.border}">Date &amp; Time</td>
        <td style="padding:11px 16px;color:${C.text};font-size:14px;border-top:1px solid ${C.border}">${ctx.showDate} &mdash; ${ctx.showTime}</td>
      </tr>
      <tr>
        <td style="padding:11px 16px;color:${C.textMuted};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid ${C.border}">Seats</td>
        <td style="padding:11px 16px;color:${C.text};font-size:14px;border-top:1px solid ${C.border}">${ctx.seatList}</td>
      </tr>
    </table>

    <!-- REFUND INFO -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);border-radius:10px;margin-bottom:24px">
      <tr>
        <td style="padding:18px 20px">
          <p style="margin:0 0 4px;color:#4ade80;font-size:14px;font-weight:600">&#10003; Refund Initiated</p>
          <p style="margin:0;color:${C.textMuted};font-size:13px">${ctx.totalAmount} will be returned to your original payment method within <strong style="color:${C.text}">5–10 business days</strong>.</p>
        </td>
      </tr>
    </table>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px">
      <tr>
        <td align="center">
          <a href="${ctx.appUrl}/movies" style="display:inline-block;background:${C.accent};color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:13px 36px;border-radius:8px">Browse Movies</a>
        </td>
      </tr>
    </table>

    <p style="margin:0;color:#52525b;font-size:12px;text-align:center">
      Questions about your refund? <a href="mailto:${ctx.supportEmail}" style="color:${C.accent};text-decoration:none">${ctx.supportEmail}</a>
    </p>
  `;

  return emailWrapper(content, ctx.appUrl, ctx.supportEmail);
}

export function reminderTemplate(ctx: EmailContext, qrCid: string): string {
  const content = `
    <!-- HERO -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px">
      <tr>
        <td align="center">
          <div style="font-size:40px;margin-bottom:12px">🔔</div>
          <h1 style="margin:0 0 6px;color:${C.text};font-size:26px;font-weight:800">Your show is tomorrow!</h1>
          <p style="margin:0;color:${C.textMuted};font-size:15px">Hi ${ctx.recipientName}, just a friendly reminder.</p>
        </td>
      </tr>
    </table>

    <!-- MOVIE HIGHLIGHT -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.rowAlt};border-radius:10px;margin-bottom:24px">
      <tr>
        <td align="center" style="padding:24px">
          <p style="margin:0 0 8px;color:${C.text};font-size:22px;font-weight:800">${ctx.movieTitle}</p>
          <p style="margin:0 0 4px;color:${C.accent};font-size:28px;font-weight:900">${ctx.showTime}</p>
          <p style="margin:0;color:${C.textMuted};font-size:14px">${ctx.showDate}</p>
        </td>
      </tr>
    </table>

    <!-- LOCATION + SEATS -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${C.border};border-radius:10px;margin-bottom:24px;overflow:hidden">
      <tr style="background:${C.rowAlt}">
        <td style="padding:11px 16px;color:${C.textMuted};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;width:40%">Theater</td>
        <td style="padding:11px 16px;color:${C.text};font-size:14px">${ctx.theaterName}, ${ctx.theaterCity}</td>
      </tr>
      <tr>
        <td style="padding:11px 16px;color:${C.textMuted};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid ${C.border}">Hall</td>
        <td style="padding:11px 16px;color:${C.text};font-size:14px;border-top:1px solid ${C.border}">${ctx.hallName}</td>
      </tr>
      <tr style="background:${C.rowAlt}">
        <td style="padding:11px 16px;color:${C.textMuted};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid ${C.border}">Seats</td>
        <td style="padding:11px 16px;color:${C.text};font-size:14px;border-top:1px solid ${C.border}">${ctx.seatList}</td>
      </tr>
      <tr>
        <td style="padding:11px 16px;color:${C.textMuted};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid ${C.border}">Booking Ref</td>
        <td style="padding:11px 16px;font-family:monospace;color:${C.accent};font-size:14px;font-weight:700;border-top:1px solid ${C.border}">${ctx.bookingRef}</td>
      </tr>
    </table>

    <!-- QR CODE -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px">
      <tr>
        <td align="center">
          <p style="margin:0 0 6px;color:${C.text};font-size:15px;font-weight:600">Your Entry QR Code</p>
          <p style="margin:0 0 14px;color:${C.textMuted};font-size:13px">Scan at the entrance — arrive 15 min early</p>
          <div style="display:inline-block;background:#fff;padding:12px;border-radius:10px">
            <img src="cid:${qrCid}" alt="Entry QR Code" width="180" height="180" style="display:block" />
          </div>
        </td>
      </tr>
    </table>

    <!-- TIP -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(220,38,38,0.08);border:1px solid rgba(220,38,38,0.2);border-radius:10px;margin-bottom:20px">
      <tr>
        <td style="padding:14px 18px">
          <p style="margin:0;color:${C.textMuted};font-size:13px">&#128248; <strong style="color:${C.text}">Pro tip:</strong> Arrive 15 minutes early to grab snacks and find your seats without rushing.</p>
        </td>
      </tr>
    </table>

    <p style="margin:0;color:#52525b;font-size:12px;text-align:center">
      Need to cancel? Visit <a href="${ctx.profileUrl}" style="color:${C.accent};text-decoration:none">your profile</a> (up to 30 min before showtime).
    </p>
  `;

  return emailWrapper(content, ctx.appUrl, ctx.supportEmail);
}
