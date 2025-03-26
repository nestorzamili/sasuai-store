export function getVerificationEmailTemplate(url: string, name?: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }
        .content {
          padding: 20px 0;
        }
        .button {
          display: inline-block;
          background-color: #4f46e5;
          color: white !important;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          color: #888;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Email Verification</h1>
        </div>
        <div class="content">
          <p>Hello${name ? ' ' + name : ''},</p>
          <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center;">
            <a href="${url}" class="button">Verify Your Email</a>
          </div>
          <p>If you didn't create an account, you can safely ignore this email.</p>
          <p>If the button doesn't work, copy and paste this URL into your browser:</p>
          <p style="word-break: break-all; font-size: 14px;"><a href="${url}">${url}</a></p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Samunu Project. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
