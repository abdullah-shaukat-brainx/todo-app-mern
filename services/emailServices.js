const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDER_GRID_API_KEY);

function sendEmail(recieverEmail, subject, content) {
  const message = {
    to: `${recieverEmail}`,
    from: `${process.env.SENDER_EMAIL}`,
    subject: `${subject}`,
    html:`<a clicktracking=off href="${content}">Click here to Verify</a>`
  };

  sgMail
    .send(message)
    .then((res) => console.log("Email sent!"))
    .catch((e) => console.log(e));
}

module.exports = {
  sendEmail,
};
