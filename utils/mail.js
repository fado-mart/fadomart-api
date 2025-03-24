
export const mailTransporter = createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAIL_ADDRESS,
        pass: process.env.MAIL_PASS_KEY
    },
    from: process.env.MAIL_ADDRESS
});