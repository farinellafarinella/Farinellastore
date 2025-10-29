# Preorders Site (Firebase)

Sito per ordini con login, quantità prodotto e pannello admin.

## Requisiti
- Firebase Project
- Abilita: Authentication (Email/Password), Firestore, Storage, Hosting, Functions (per email opzionale)

## Setup rapido
1. Copia il tuo `firebaseConfig` in `public/js/firebase.js` (sezione TODO).
2. Da terminale nella cartella del progetto:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init # scegli Hosting, Firestore, Storage, Functions (Node).
   firebase deploy
   ```
3. In Firestore crea le collezioni `products` e `orders` (verranno create automaticamente al primo salvataggio).
4. Imposta l'email admin in `public/js/app.js` e `public/js/admin.js` (variabile ADMIN_EMAIL).

## Funzioni chiave
- Utenti: registrazione/login, sfoglia catalogo, ordina (nome, contatti, spedizione).
- Quantità: il pulsante "Ordina" è disabilitato se `quantita === 0`.
- Ordine: al salvataggio l'app usa una **transaction** per decrementare `quantita` in modo sicuro.
- Admin: vede gli ordini, li segna “pronto” (trigger email opzionale), aggiunge/modifica prodotti, carica immagini su Storage.

## Email automatiche (opzionale)
Usa la Cloud Function in `functions/index.js` (SendGrid o SMTP). Imposta le variabili ambiente:
```bash
firebase functions:config:set sendgrid.key="LA_TUA_API_KEY"
# Oppure credenziali SMTP:
firebase functions:config:set smtp.user="user" smtp.pass="pass" smtp.host="smtp.example.com" smtp.port="465"
```
Poi:
```bash
firebase deploy --only functions
```

## Sicurezza (firestore.rules)
Trovi regole di esempio in `firestore.rules`. Ricordati di **deployarle**.
