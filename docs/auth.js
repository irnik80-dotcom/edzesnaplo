// Bejelentkezés (Firebase Authentication) és mentés (Cloud Firestore: gym/{uid} + gym/{uid}/sessions).
// Az oldal fő szkriptje adja: window.Gym.attach(api, uid), Gym.detach(), Gym.setWho(név, üzenet).
import { firebaseConfig } from './firebase-config.js';

const $ = (id) => document.getElementById(id);
const Gym = window.Gym;

const MSG = {
  'auth/invalid-credential': 'Hibás e-mail-cím vagy jelszó.',
  'auth/wrong-password': 'Hibás jelszó.',
  'auth/user-not-found': 'Nincs ilyen felhasználó.',
  'auth/email-already-in-use': 'Ezzel az e-mail-címmel már van fiók, lépj be.',
  'auth/weak-password': 'A jelszó legalább 6 karakter legyen.',
  'auth/invalid-email': 'Érvénytelen e-mail-cím.',
  'auth/popup-closed-by-user': 'A bejelentkező ablak bezárult.',
  'auth/popup-blocked': 'A böngésző letiltotta a felugró ablakot.',
  'auth/network-request-failed': 'Nincs internetkapcsolat.',
  'auth/too-many-requests': 'Túl sok próbálkozás, próbáld újra később.'
};
const msgOf = (e) => MSG[e && e.code] || ('A bejelentkezés nem sikerült: ' + ((e && e.message) || ''));

start().catch((e) => { console.error(e); Gym.setWho(null, 'A bejelentkezés most nem érhető el.'); });

async function start() {
  const V = '10.12.2';
  const [{ initializeApp }, A, F] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`)
  ]);
  const app = initializeApp(firebaseConfig);
  const auth = A.getAuth(app);
  auth.languageCode = 'hu';
  let db;
  try { db = F.initializeFirestore(app, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) }); }
  catch (e) { db = F.getFirestore(app); }

  const err = (t) => { const el = $('login-err'); if (el) el.textContent = t || ''; };
  const email = () => ($('login-email') || {}).value.trim();
  const pass = () => ($('login-pass') || {}).value;
  const run = async (fn) => { err(''); try { await fn(); } catch (e) { err(msgOf(e)); } };

  // A beállítások fül újrarajzolódik, ezért eseménydelegálással figyelünk.
  document.addEventListener('click', (e) => {
    const id = e.target && e.target.id;
    if (id === 'login-google') run(() => A.signInWithPopup(auth, new A.GoogleAuthProvider()));
    else if (id === 'login-register') {
      const f = $('login-form'); if (!f.reportValidity()) return;
      run(() => A.createUserWithEmailAndPassword(auth, email(), pass()));
    } else if (id === 'login-reset') {
      if (!email()) { err('Írd be az e-mail-címed, és oda küldjük a jelszó-visszaállító levelet.'); return; }
      A.sendPasswordResetEmail(auth, email()).then(() => err('Elküldtük a levelet.')).catch((x) => err(msgOf(x)));
    } else if (id === 'logout') {
      if (confirm('Kilépsz? Az adataid a felhőben megmaradnak.')) A.signOut(auth);
    }
  });
  document.addEventListener('submit', (e) => {
    if (e.target.id !== 'login-form') return;
    e.preventDefault();
    run(() => A.signInWithEmailAndPassword(auth, email(), pass()));
  });

  let attached = null;
  A.onAuthStateChanged(auth, async (u) => {
    if (u) {
      if (attached === u.uid) return;
      attached = u.uid;
      const ref = F.doc(db, 'gym', u.uid);
      const col = F.collection(db, 'gym', u.uid, 'sessions');
      const api = {
        getDoc: async () => { const s = await F.getDoc(ref); return s.exists() ? s.data() : null; },
        setDoc: (o) => F.setDoc(ref, o),
        listSessions: async () => (await F.getDocs(col)).docs.map((d) => d.data()),
        addSession: (s) => F.setDoc(F.doc(col, s.id), s),
        delSession: (id) => F.deleteDoc(F.doc(col, id)),
        me: { name: u.displayName || '', email: u.email || '' },
        // admin (csak ha a szabályok engedik): mindenki listája, más naplója és terve
        adminList: async () => {
          const docs = (await F.getDocs(F.collection(db, 'gym'))).docs.filter((d) => d.id !== u.uid);
          return Promise.all(docs.map(async (d) => {
            const x = d.data();
            // a napló számát és utolsó dátumát magából a naplóból számoljuk
            const ss = (await F.getDocs(F.collection(db, 'gym', d.id, 'sessions'))).docs.map((z) => z.data());
            return { uid: d.id, name: x.name || '', email: x.email || '', count: ss.length, last: ss.reduce((m, z) => Math.max(m, z.date || 0), 0), at: x.at || 0 };
          }));
        },
        adminSessions: async (uid) => (await F.getDocs(F.collection(db, 'gym', uid, 'sessions'))).docs.map((d) => d.data()),
        adminDoc: async (uid) => { const s = await F.getDoc(F.doc(db, 'gym', uid)); return s.exists() ? s.data() : null; }
      };
      Gym.setWho(u.displayName || u.email || 'ismeretlen');
      try { await Gym.attach(api, u.uid); }
      catch (e) { console.error(e); Gym.setWho(u.displayName || u.email, 'A felhős adatok betöltése nem sikerült (' + ((e && (e.code || e.message)) || 'ismeretlen hiba') + ').'); }
    } else {
      if (attached) { attached = null; Gym.detach(); }
      Gym.setWho(null);
    }
  });
}
