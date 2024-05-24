const sgMail = require("@sendgrid/mail");
const SENDER_GRID_API_KEY = process.env.SENDER_GRID_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL;

sgMail.setApiKey(SENDER_GRID_API_KEY);

function sendEmail (recieverEmail, subject, content) {
  const message = {
    to: `${recieverEmail}`,
    from: `${SENDER_EMAIL}`,
    subject: `${subject}`,
    text: `${content}`,
  };

  sgMail
    .send(message)
    .then((res) => console.log("Email sent!"))
    .catch((e) => console.log(e));
}

module.exports = {
  sendEmail,
};