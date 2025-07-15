import nodemailer from "nodemailer";

export const sendOTPEmail = async (to, otpCode) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: "icbnqzszmzgksclm",
    },
  });

  const mailOptions = {
    from: `"LedgerStack" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify your email - LedgerStack",
    html: `<h3>Your OTP code is: <b>${otpCode}</b></h3><p>This code will expire in 5 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
};
