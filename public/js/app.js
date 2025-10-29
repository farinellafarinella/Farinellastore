// =====================================================
// FARINELLA STORE - Gestione Login, Articoli e Eventi
// =====================================================

import { db, auth } from './firebase.js';
import {
  collection, getDocs, onSnapshot, addDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// =====================================================
// PAGE DETECTION
// =====================================================
const currentPage = window.location.pathname.split('/').pop();

// =====================================================
// LOGIN PAGE (index.html)
// =====================================================
if (currentPage === 'index.html' || currentPage === '') {
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  // Login
  loginBtn?.addEventListener('click', async () => {
    try {
      await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
      window.location.href = './articoli.html';
    } catch (err) {
      alert('Errore login: ' + err.message);
    }

// Controllo se è l'admin
const user = auth.currentUser;
if (user.email === 'mrpinkukulele@gmail.com') {
  window.location.href = './admin.html';
} else {
  window.location.href = './articoli.html';
}
  });

  // Registrazione
  registerBtn?.addEventListener('click', async () => {
    try {
      await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
      alert('Registrazione completata ✅');
      window.location.href = './articoli.html';
    } catch (err) {
      alert('Errore registrazione: ' + err.message);
    }
  });

  // Se già loggato → vai agli articoli
  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.href = './articoli.html';
    }
  });
}

// =====================================================
// ARTICOLI PAGE (articoli.html)
// =====================================================
if (currentPage === 'articoli.html') {
  const productsContainer = document.getElementById('productsContainer');
  const orderModal = document.getElementById('orderModal');
  const orderForm = document.getElementById('orderForm');
  const closeModal = document.getElementById('closeModal');
  const logoutBtn = document.getElementById('logoutBtn');

  // Controllo autenticazione
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      alert('Devi prima accedere.');
      window.location.href = './index.html';
    }
  });

  // Logout
  logoutBtn?.addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = './index.html';
  });

  // Caricamento prodotti
  async function loadProducts() {
    const querySnapshot = await getDocs(collection(db, 'products'));
    productsContainer.innerHTML = '';

    querySnapshot.forEach((doc) => {
      const p = doc.data();
      if (!p.attivo) return;

      const card = document.createElement('div');
      card.classList.add('product-card');
      card.innerHTML = `
        <img src="${p.immagine}" alt="${p.nome}" class="product-image" />
        <h3>${p.nome}</h3>
        <p>${p.descrizione}</p>
        <p><strong>€${p.prezzo}</strong></p>
        <button class="order-btn" data-product="${p.nome}" ${p.quantita <= 0 ? 'disabled' : ''}>
          ${p.quantita <= 0 ? 'Non disponibile' : 'Ordina'}
        </button>
      `;
      card.querySelector('.order-btn').addEventListener('click', (e) => {
        const name = e.target.dataset.product;
        openOrderModal(name);
      });

      productsContainer.appendChild(card);
    });
  }

// Apertura modale ordine
function openOrderModal(productName) {
  orderModal.style.display = 'flex';
  orderForm.dataset.product = productName;

  // Precompila l'email dell'utente loggato
  const emailUtente = auth.currentUser?.email || '';
  const contattoField = orderForm.querySelector('input[name="contatto"]');
  contattoField.value = emailUtente;
}

  closeModal?.addEventListener('click', () => {
    orderModal.style.display = 'none';
  });

  orderForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = orderForm['nome'].value;
    const contatto = orderForm['contatto'].value;
    const spedizione = orderForm['spedizione'].checked;
    const prodotto = orderForm.dataset.product;
    const emailUtente = auth.currentUser?.email;

    await addDoc(collection(db, 'orders'), {
      prodotto,
      nome,
      contatto,
      spedizione,
      emailUtente,
      data: new Date(),
      stato: 'in attesa'
    });

    alert('Ordine inviato ✅');
    orderForm.reset();
    orderModal.style.display = 'none';
  });

  loadProducts();
}

// =====================================================
// EVENTI PAGE (eventi.html)
// =====================================================
if (currentPage === 'eventi.html') {
  const eventList = document.getElementById('eventList');
  const logoutBtn = document.getElementById('logoutBtn');

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      alert('Devi prima accedere.');
      window.location.href = './index.html';
    }
  });

  logoutBtn?.addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = './index.html';
  });

  // Caricamento eventi
  onSnapshot(collection(db, 'events'), (snap) => {
    eventList.innerHTML = '';
    snap.forEach((doc) => {
      const e = doc.data();
      const div = document.createElement('div');
      div.classList.add('event-card');
      div.innerHTML = `
        <h3>${e.titolo}</h3>
        <p>${e.descrizione}</p>
        <p><strong>${e.data}</strong></p>
      `;
      eventList.appendChild(div);
    });
  });
}
