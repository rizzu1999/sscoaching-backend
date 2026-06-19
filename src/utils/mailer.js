const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function invoiceEmailHtml({ invoiceNumber, studentName, courseName, amount, paymentType, billingInfo, year }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: Arial, sans-serif; background: #f5f7fa; margin: 0; padding: 20px; }
  .card { max-width: 560px; margin: auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #1a4d8a, #2b6eb5); padding: 28px 32px; color: #fff; }
  .header h1 { margin: 0 0 4px; font-size: 22px; }
  .header p { margin: 0; opacity: 0.8; font-size: 13px; }
  .body { padding: 28px 32px; }
  .invoice-num { background: #eef4fc; border-radius: 10px; padding: 14px 20px; text-align: center; margin-bottom: 24px; }
  .invoice-num .label { font-size: 11px; color: #7a8fa6; text-transform: uppercase; letter-spacing: 1px; }
  .invoice-num .value { font-size: 22px; font-weight: 800; color: #1a4d8a; margin-top: 4px; }
  .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f4f8; font-size: 14px; }
  .row:last-child { border: none; }
  .row .key { color: #7a8fa6; }
  .row .val { font-weight: 600; color: #0d1b2a; }
  .total-row { background: #f0fdf4; border-radius: 10px; padding: 14px 20px; margin-top: 16px; display: flex; justify-content: space-between; }
  .total-row .key { font-weight: 700; color: #166534; }
  .total-row .val { font-size: 20px; font-weight: 800; color: #166534; }
  .steps { margin-top: 24px; }
  .step { display: flex; gap: 12px; margin-bottom: 12px; }
  .step-num { width: 28px; height: 28px; border-radius: 50%; background: #2b6eb5; color: #fff; font-weight: 800; font-size: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .step-text strong { display: block; font-size: 13px; color: #0d1b2a; }
  .step-text span { font-size: 12px; color: #7a8fa6; }
  .footer { background: #f8fafc; padding: 20px 32px; text-align: center; font-size: 12px; color: #7a8fa6; }
</style></head>
<body>
<div class="card">
  <div class="header">
    <h1>SS Coaching</h1>
    <p>Rise From Failure · Est. 2001</p>
  </div>
  <div class="body">
    <p style="font-size:15px;color:#0d1b2a;margin-bottom:20px">Dear <strong>${studentName}</strong>, your enrollment is confirmed! 🎉</p>
    <div class="invoice-num">
      <div class="label">Invoice Number</div>
      <div class="value">${invoiceNumber}</div>
    </div>
    <div class="row"><span class="key">Course</span><span class="val">${courseName}</span></div>
    <div class="row"><span class="key">Payment Type</span><span class="val">${paymentType === 'cod' ? 'Cash on Delivery' : paymentType === 'free' ? 'Free' : 'Online'}</span></div>
    <div class="row"><span class="key">Date</span><span class="val">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
    <div class="total-row">
      <span class="key">Total Amount</span>
      <span class="val">₹${amount}</span>
    </div>
    ${paymentType === 'cod' ? `
    <div class="steps">
      <p style="font-weight:700;color:#0d1b2a;margin-bottom:12px">Next Steps:</p>
      <div class="step"><div class="step-num">1</div><div class="step-text"><strong>Invoice Saved</strong><span>This invoice has been emailed to you for records</span></div></div>
      <div class="step"><div class="step-num">2</div><div class="step-text"><strong>Visit Our Center</strong><span>Come to SS Coaching, Lucknow and pay ₹${amount}</span></div></div>
      <div class="step"><div class="step-num">3</div><div class="step-text"><strong>Start Learning</strong><span>Access your course from the student app dashboard</span></div></div>
    </div>` : ''}
  </div>
  <div class="footer">
    SS Coaching · Lucknow, Uttar Pradesh · © ${year}<br>
    This is an automated invoice. Please do not reply to this email.
  </div>
</div>
</body>
</html>`;
}

async function sendInvoiceEmail({ to, invoiceNumber, studentName, courseName, amount, paymentType, billingInfo }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[Email skipped - no SMTP config] Invoice ${invoiceNumber} for ${to}`);
    return false;
  }
  try {
    await transporter.sendMail({
      from: `"SS Coaching" <${process.env.SMTP_USER}>`,
      to,
      subject: `Invoice ${invoiceNumber} — SS Coaching`,
      html: invoiceEmailHtml({ invoiceNumber, studentName, courseName, amount, paymentType, billingInfo, year: new Date().getFullYear() }),
    });
    return true;
  } catch (err) {
    console.error('Email send error:', err.message);
    return false;
  }
}

module.exports = { sendInvoiceEmail };
