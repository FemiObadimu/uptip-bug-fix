const mailgun = require("mailgun-js");

const config = {
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_SERVER,
};

module.exports = (recipient, message) => {
  const mailgunz = mailgun(config);

  return new Promise((resolve, reject) => {
    const data = {
      from: `${process.env.EMAIL_FROM}`,
      to: recipient,
      subject: message.subject,
      html: message.html,
    };

    mailgunz
      .messages()
      .send(data, (err) => (err ? reject(err) : resolve(true)));
  });
};
