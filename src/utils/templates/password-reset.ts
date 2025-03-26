export function getPasswordResetEmailTemplate(url: string, name?: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
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
        .warning {
          background-color: #fff8e1;
          padding: 10px;
          border-radius: 4px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hello${name ? ' ' + name : ''},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center;">
            <a href="${url}" class="button">Reset Password</a>
          </div>
          <div class="warning">
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request to reset your password, you can safely ignore this email.</p>
          </div>
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
