const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");
require("dotenv").config('./projectParameter.env');

const mailerSend = new MailerSend({
    apiKey: process.env.API_KEY,
});

const sentFrom = new Sender("TranThanhTung@wellfish-dom.com", "TranThanhTung-TheOTP");

const recipients = [
    new Recipient("tung01052003@gmail.com", "Trần Thanh Tùng")
];


const sendEmail = async () => {
    const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject("This is a Subject")
    .setHtml("<strong>This is the HTML content</strong>")
    .setText("This is the text content");
    await mailerSend.email.send(emailParams);
}

module.exports = {
    sendEmail
}