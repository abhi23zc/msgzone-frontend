import nodemailer from "nodemailer";

export async function POST(request: Request) {
  const { name, email, subject, category, message } = await request.json();

  let server_email = process.env.NEXT_PUBLIC_EMAIL;
  let server_pass = process.env.NEXT_PUBLIC_PASS;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: server_email,
      pass: server_pass,
    },
  });

  // const transporter = nodemailer.createTransport({
  //     host: 'smtp.gmail.com',
  //     port: 465,
  //     secure: true,
  //     auth: {
  //         user: server_email,
  //         pass: server_pass
  //     },
  // });

 const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New User Message</title>
</head>
<body style="margin: 0; padding: 0; background: #f1f3f5; font-family: 'Segoe UI', Tahoma, sans-serif;">
  <div style="max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.08); overflow: hidden;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #4c6ef5, #5f8bfa); padding: 30px; text-align: center; color: #fff;">
      <h1 style="margin: 0; font-size: 24px;">📩 New Contact Message</h1>
      <p style="margin: 6px 0 0; font-size: 14px; font-weight: 300;">You've received a new message from your msgzone platform.</p>
    </div>

    <!-- Body -->
    <div style="padding: 30px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
        <tr>
          <td style="font-weight: 500; padding: 12px 0; color: #495057;">Name:</td>
          <td style="padding: 12px 0;">${name}</td>
        </tr>
        <tr style="border-top: 1px solid #e9ecef;">
          <td style="font-weight: 500; padding: 12px 0; color: #495057;">Email:</td>
          <td style="padding: 12px 0;">${email}</td>
        </tr>
        <tr style="border-top: 1px solid #e9ecef;">
          <td style="font-weight: 500; padding: 12px 0; color: #495057;">Subject:</td>
          <td style="padding: 12px 0;">${subject}</td>
        </tr>
        <tr style="border-top: 1px solid #e9ecef;">
          <td style="font-weight: 500; padding: 12px 0; color: #495057;">Category:</td>
          <td style="padding: 12px 0;">${category}</td>
        </tr>
      </table>

      <!-- Message -->
      <div style="margin-top: 30px;">
        <h3 style="margin-bottom: 10px; color: #343a40;">Message</h3>
        <div style="padding: 16px; border: 1px solid #e9ecef; background: #f8f9fa; border-radius: 8px; color: #212529; white-space: pre-wrap;">
          ${message}
        </div>
      </div>

      <!-- CTA -->
      <div style="margin-top: 40px; text-align: center;">
        <a href="mailto:${email}" style="display: inline-block; padding: 12px 24px; background: #4c6ef5; color: #fff; border-radius: 25px; text-decoration: none; font-weight: 500; transition: background 0.3s;">
          Reply to ${name}
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f1f3f5; padding: 16px 30px; text-align: center; font-size: 13px; color: #868e96; border-top: 1px solid #dee2e6;">
      <p style="margin: 4px 0;">Sent on ${new Date().toLocaleDateString()}</p>
      <p style="margin: 0;">This message was sent from your contact form.</p>
    </div>
  </div>
</body>
</html>
`;


  try {
    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: "webifyit.in@gmail.com",
      subject: `🌟 New Message: ${subject} | From ${name}`,
      html,
    });

    return new Response(
      JSON.stringify({ message: "Email sent successfully!" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Email send error:", error);
    return new Response(
      JSON.stringify({ message: "Failed to send email", error }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
