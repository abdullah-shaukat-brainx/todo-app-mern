const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDER_GRID_API_KEY);

function sendEmail(recieverEmail, subject, link, text) {
  const message = {
    to: recieverEmail,
    from: process.env.SENDER_EMAIL,
    subject: subject,
    text: text,
    html: `<p>${text.replace(
      /\n/g,
      "<br>"
    )}</p><br><a clicktracking=off href="${link}">Click here!!!</a>`,
  };

  sgMail
    .send(message)
    .then((res) => console.log("Email sent!"))
    .catch((e) => console.log(e));
}

module.exports = {
  sendEmail,
};
