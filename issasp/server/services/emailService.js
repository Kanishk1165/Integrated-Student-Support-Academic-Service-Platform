const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const templates = {
  created: (query) => ({
    subject: `Query Submitted: ${query.queryId} - ${query.title}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
        <h2 style="color:#1a1a2e">Query Submitted Successfully ✅</h2>
        <p>Your query <strong>${query.queryId}</strong> has been received.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px">
          <tr><td style="padding:8px;background:#f8f9fb;font-weight:600">Title</td><td style="padding:8px">${query.title}</td></tr>
          <tr><td style="padding:8px;background:#f8f9fb;font-weight:600">Category</td><td style="padding:8px">${query.category}</td></tr>
          <tr><td style="padding:8px;background:#f8f9fb;font-weight:600">Priority</td><td style="padding:8px">${query.priority}</td></tr>
          <tr><td style="padding:8px;background:#f8f9fb;font-weight:600">Status</td><td style="padding:8px">Open</td></tr>
        </table>
        <p style="color:#888;margin-top:24px">You'll be notified when there's an update.</p>
      </div>
    `,
  }),
  status_update: (query) => ({
    subject: `Query ${query.queryId} Status Updated: ${query.status.toUpperCase()}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
        <h2 style="color:#1a1a2e">Query Status Updated</h2>
        <p>Your query <strong>${query.queryId}</strong> status has been updated to <strong>${query.status}</strong>.</p>
      </div>
    `,
  }),
  new_response: (query) => ({
    subject: `New Response on Query ${query.queryId}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
        <h2 style="color:#1a1a2e">New Response on Your Query</h2>
        <p>A response has been added to your query <strong>${query.queryId}: ${query.title}</strong>.</p>
        <p>Please login to view the full response.</p>
      </div>
    `,
  }),
};

exports.sendQueryNotification = async (toEmail, query, type) => {
  if (!process.env.EMAIL_USER) return; // skip if email not configured
  const { subject, html } = templates[type](query);
  await transporter.sendMail({
    from: `"ISSASP Portal" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    html,
  });
};
