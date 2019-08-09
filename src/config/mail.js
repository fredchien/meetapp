export default {
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secura: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  default: {
    from: 'Equipe MeetUp <noreply@gobarber.com>',
  },
};
