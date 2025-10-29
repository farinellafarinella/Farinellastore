import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

// Configurazione Firebase del progetto storeonline-5c0c2
const firebaseConfig = {
  apiKey: "AIzaSyCoW3L2TUsHHjNxhKAsdfNPsdE87yPAxxg",
  authDomain: "storeonline-5c0c2.firebaseapp.com",
  projectId: "storeonline-5c0c2",
  storageBucket: "storeonline-5c0c2.appspot.com",
  messagingSenderId: "738416554341",
  appId: "1:738416554341:web:cb0b4f74b0604d2a6e318c",
  measurementId: "G-Z6MKT83SYD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
