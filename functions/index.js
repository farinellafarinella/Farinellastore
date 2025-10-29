const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

admin.initializeApp();

// Config: scegli uno tra SendGrid o SMTP
const SENDGRID_KEY = process.env.SENDGRID_API_KEY || (functions.config().sendgrid && functions.config().sendgrid.key);
if (SENDGRID_KEY) sgMail.setApiKey(SENDGRID_KEY);

const SMTP_USER = process.env.SMTP_USER || (functions.config().smtp && functions.config().smtp.user);
const SMTP_PASS = process.env.SMTP_PASS || (functions.config().smtp && functions.config().smtp.pass);
const SMTP_HOST = process.env.SMTP_HOST || (functions.config().smtp && functions.config().smtp.host);
const SMTP_PORT = process.env.SMTP_PORT || (functions.config().smtp && functions.config().smtp.port);

async function sendMail({to, subject, text, html}){
  if (SENDGRID_KEY){
    const msg = { to, from: 'no-reply@farinellastore.it', subject, text, html };
    await sgMail.send(msg);
    return;
  }
  if (SMTP_USER && SMTP_PASS && SMTP_HOST){
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 465),
      secure: true,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
    await transporter.sendMail({ from: 'no-reply@farinellastore.it', to, subject, text, html });
    return;
  }
  console.log('Nessun provider email configurato');
}

exports.notifyWhenReady = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    if (before.stato !== 'pronto' && after.stato === 'pronto'){
      const to = after.emailTel && String(after.emailTel).includes('@') ? after.emailTel : null;
      if (!to) { console.log('Contatto non è una email, skip'); return; }
      const subject = `Il tuo articolo "${after.productName}" è pronto`;
      const text = `Ciao ${after.nome}, il tuo articolo "${after.productName}" è pronto! Ti contatteremo per consegna o spedizione.`;
      const html = `<p>Ciao <b>${after.nome}</b>,</p><p>il tuo articolo "<b>${after.productName}</b>" è pronto! Ti contatteremo per consegna o spedizione.</p>`;
      await sendMail({ to, subject, text, html });
    }
  });
