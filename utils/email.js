const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlTotext = require("html-to-text");
const path = require("path");

// new Email(user, url).sendWelcome();
// new Email(user, url).sendRestPwd();

module.exports = class Email {
  constructor(user, url, reseterToken) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `NovaTech <NovaTech@gmail.com>`;
    this.reseterToken = reseterToken;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      return nodemailer.createTransport({
        services: "hotmail",
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.MAIL_TRAP_HOST,
      port: process.env.MAIL_TRAP_PORT,
      auth: {
        user: process.env.MAIL_TRAP_USERNAME,
        pass: process.env.MAIL_TRAP_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    /* 1) Reder the template
        `${__dirname}/../views/email/${template}.pug` */
    const html = pug.renderFile(
      path.join(__dirname, "..", "views", "email", `${template}.pug`),
      {
        firstName: this.firstName,
        url: this.url,
        subject,
        from: "Nova Tech",
        reseterToken: this.reseterToken,
      }
    );
    // 2) Define the email options
    const emailOption = {
      from: this.from,
      to: this.to,
      subject: subject,
      html,
      text: htmlTotext.convert(html),
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(emailOption);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to the Betel Bakery's Website.");
  }

  async sendResetPwd() {
    await this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
};
