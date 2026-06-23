const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `WorkWave <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  try {
  const info = await transporter.sendMail(mailOptions);
  console.log("Email sent:", info.response);
} catch (error) {
  console.error("Email Error:", error);
  throw error;
}
};

module.exports = sendEmail;