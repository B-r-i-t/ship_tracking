const nodemailer = require("nodemailer");

const createTransport = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === "465",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

const STATUS_MESSAGES = {
  Processing: "Your shipment is being processed and will be dispatched shortly.",
  "In Transit": "Your shipment is on its way! It's currently in transit.",
  "Out for Delivery": "Great news! Your shipment is out for delivery today.",
  Delivered: "Your shipment has been delivered successfully. Thank you for using ShipTrack!",
  Delayed: "We regret to inform you that your shipment has been delayed. We apologize for the inconvenience.",
};

const sendStatusEmail = async (shipment) => {
  if (!process.env.SMTP_USER || !shipment.receiver?.email) return;

  const transporter = createTransport();
  const statusMsg = STATUS_MESSAGES[shipment.status] || "Your shipment status has been updated.";
  const trackUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/track/${shipment.trackingId}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "ShipTrack <noreply@shiptrack.com>",
    to: shipment.receiver.email,
    subject: `Shipment Update: ${shipment.trackingId} — ${shipment.status}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f7f4; color: #1a1915;">
        <div style="background: #1a1915; border-radius: 12px; padding: 24px; margin-bottom: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">📦 ShipTrack</h1>
        </div>
        <div style="background: white; border-radius: 12px; padding: 28px; border: 1px solid #e5e2db;">
          <h2 style="margin: 0 0 8px; font-size: 20px;">Shipment Status Update</h2>
          <p style="color: #6b6860; margin: 0 0 20px; font-size: 15px;">Hello ${shipment.receiver.name},</p>
          <p style="color: #6b6860; margin: 0 0 20px; font-size: 15px;">${statusMsg}</p>
          <div style="background: #f2f0ec; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <table style="width: 100%; font-size: 14px;">
              <tr><td style="color: #6b6860; padding: 4px 0;">Tracking ID</td><td style="text-align: right; font-weight: 600; font-family: monospace;">${shipment.trackingId}</td></tr>
              <tr><td style="color: #6b6860; padding: 4px 0;">Status</td><td style="text-align: right; font-weight: 600;">${shipment.status}</td></tr>
              <tr><td style="color: #6b6860; padding: 4px 0;">Destination</td><td style="text-align: right;">${shipment.destination}</td></tr>
              ${shipment.estimatedDelivery ? `<tr><td style="color: #6b6860; padding: 4px 0;">Est. Delivery</td><td style="text-align: right;">${new Date(shipment.estimatedDelivery).toLocaleDateString()}</td></tr>` : ""}
            </table>
          </div>
          <a href="${trackUrl}" style="display: inline-block; background: #1a1915; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500; font-size: 15px;">Track Your Shipment →</a>
        </div>
        <p style="text-align: center; color: #9b998f; font-size: 12px; margin-top: 20px;">ShipTrack · Real-time global shipment tracking</p>
      </body>
      </html>
    `,
  });
};

module.exports = { sendStatusEmail };
