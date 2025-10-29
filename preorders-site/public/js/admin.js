import { auth, db, storage } from './firebase.js';
import {
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  collection, addDoc, deleteDoc, doc, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

// --- CONTROLLO LOGIN ADMIN ---
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert('Devi prima effettuare il login.');
    window.location.href = './index.html';
    return;
  }

  if (user.email !== 'mrpinkukulele@gmail.com') {
    alert('Accesso non autorizzato. Torni agli articoli.');
    window.location.href = './articoli.html';
  }
});

// --- LOGOUT ---
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = './index.html';
});

// --- GESTIONE NAV SECTIONS ---
const ordiniSection = document.getElementById('orders-section');
const articoliSection = document.getElementById('products-section');
const eventiSection = document.getElementById('event-section');

document.getElementById('ordiniBtn').addEventListener('click', () => {
  ordiniSection.style.display = 'block';
  articoliSection.style.display = 'none';
  eventiSection.style.display = 'none';
});

document.getElementById('articoliBtn').addEventListener('click', () => {
  ordiniSection.style.display = 'none';
  articoliSection.style.display = 'block';
  eventiSection.style.display = 'none';
});

document.getElementById('eventiBtn').addEventListener('click', () => {
  ordiniSection.style.display = 'none';
  articoliSection.style.display = 'none';
  eventiSection.style.display = 'block';
});
// --- MOSTRA ORDINI IN TEMPO REALE ---
const ordersList = document.getElementById('ordersList');

if (ordersList) {
  onSnapshot(collection(db, 'orders'), (snapshot) => {
    ordersList.innerHTML = ''; // pulisce la lista

    if (snapshot.empty) {
      ordersList.innerHTML = '<p>Nessun ordine ricevuto.</p>';
      return;
    }

    snapshot.forEach((docSnap) => {
      const o = docSnap.data();
      const div = document.createElement('div');
      div.classList.add('card');
      div.innerHTML = `
        <h3>🧾 Ordine di ${o.nome || 'Cliente sconosciuto'}</h3>
        <p><strong>Email:</strong> ${o.email || '-'}</p>
        <p><strong>Prodotto:</strong> ${o.prodotto || 'N/D'}</p>
        <p><strong>Quantità:</strong> ${o.quantita || 1}</p>
        <p><strong>Spedizione:</strong> ${o.spedizione ? 'A domicilio 🚚' : 'Ritiro in sede 📦'}</p>
        <p><strong>Data ordine:</strong> ${new Date(o.data || Date.now()).toLocaleString('it-IT')}</p>
        <button class="btn red" onclick="completaOrdine('${docSnap.id}')">Segna come completato</button>
      `;
      ordersList.appendChild(div);
    });
  });
}

// --- COMPLETA ORDINE ---
window.completaOrdine = async (id) => {
  if (!confirm('Vuoi segnare questo ordine come completato?')) return;
  await deleteDoc(doc(db, 'orders', id));
  alert('Ordine completato ✅');
};

// --- CREAZIONE EVENTI ---
const eventForm = document.getElementById('eventForm');
const eventList = document.getElementById('eventList');

if (eventForm) {
  eventForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const titolo = eventForm['titolo'].value;
    const descrizione = eventForm['descrizione'].value;
    const data = eventForm['data'].value;
    const luogo = eventForm['luogo'].value;
    const file = eventForm['immagine'].files[0];

    try {
      let imageURL = '';
      if (file) {
        const storageRef = ref(storage, `events/${file.name}`);
        await uploadBytes(storageRef, file);
        imageURL = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, 'events'), {
        titolo,
        descrizione,
        data,
        luogo,
        immagine: imageURL,
        attivo: true
      });

      alert('Evento creato con successo 🎉');
      eventForm.reset();
    } catch (err) {
      console.error('Errore durante la creazione evento:', err);
      alert('Errore durante il salvataggio.');
    }
  });
}

// --- LISTA EVENTI LIVE ---
if (eventList) {
  onSnapshot(collection(db, 'events'), (snapshot) => {
    eventList.innerHTML = '';
    snapshot.forEach(docSnap => {
      const e = docSnap.data();
      const div = document.createElement('div');
      div.classList.add('event-card');
      div.innerHTML = `
        <h4>${e.titolo}</h4>
        <p>${e.data} – ${e.luogo}</p>
        <p>${e.descrizione}</p>
        ${e.immagine ? `<img src="${e.immagine}" class="event-image">` : ''}
        <button class="btn red" onclick="deleteEvent('${docSnap.id}')">Elimina</button>
      `;
      eventList.appendChild(div);
    });
  });
}

// --- ELIMINA EVENTO ---
window.deleteEvent = async (id) => {
  await deleteDoc(doc(db, 'events', id));
  alert('Evento eliminato ✅');
};
