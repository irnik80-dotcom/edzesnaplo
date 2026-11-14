# Edzésnapló

Telepíthető edzésnapló-webapp (PWA) Androidra. Napok külön füleken (Mónika A/B/C felsőtest-terve kezdő tartalomként), sorozatonkénti pipálás, pihenőidő-számláló rezgéssel, napló, grafikonok, kg/font váltás, gyakorlatok és napok szerkesztése. Bejelentkezve az adatok a felhőbe mentődnek (Firebase, ugyanaz a projekt, mint a Presente!-é).

- `edzesnaplo.html`: a forrás (Claude artifactként is fut, ott csak böngészős mentéssel).
- `docs/`: a nyilvános weboldal (GitHub Pages). A `docs/index.html` generált fájl: ha az `edzesnaplo.html` változik, futtasd: `node tools/build-site.mjs` (ez a service worker verzióját is lépteti, így a telefonok megkapják az új változatot).
- `docs/auth.js`: bejelentkezés és felhős mentés (`gym/{uid}` dokumentum + `gym/{uid}/sessions` napló).
- `docs/sw.js`, `docs/manifest.webmanifest`, ikonok: telepíthetőség és offline működés.
- `firestore-gym.rules`: a Firestore-szabályokhoz hozzáfűzendő rész.

## Beüzemelés

### 1. Firestore-szabályok (egyszer)
1. https://console.firebase.google.com → **coniuga80** projekt → **Build → Firestore Database → Rules**.
2. A meglévő szabályokat **ne töröld**. A `firestore-gym.rules` tartalmát másold be közvetlenül a `match /databases/{database}/documents {` blokk záró `}` jele elé (vagyis az utolsó két `}` elé).
3. **Publish**.

A bejelentkezéshez nem kell más: az `irnik80-dotcom.github.io` domain már engedélyezve van a Presente! miatt.

### 2. GitHub Pages
1. **Settings → Pages** → Source: **Deploy from a branch** → Branch: `main`, mappa: **`/docs`** → Save.
2. 1–2 perc múlva: **https://irnik80-dotcom.github.io/edzesnaplo/**

### 3. Telepítés a telefonra
1. Nyisd meg a fenti címet Chrome-ban.
2. Menü (⋮) → **Hozzáadás a kezdőképernyőhöz** / **Alkalmazás telepítése**.
3. Az appban: ⚙ → **Belépés Google-fiókkal** (vagy e-maillel). Mindenki a saját fiókjával lép be, így mindenkinek külön terve és naplója van.

## Használat
- **Edzés:** a nap fülén írd be a súlyt és az ismétlést, majd pipáld ki a sorozatot. A pihenőidő magától indul. A végén **Edzés befejezése**: bekerül a naplóba.
- **Súly frissítése:** ha más súllyal csináltad, az utolsó sorozat súlya lesz a következő alkalom kiinduló súlya. Ha minden sorozatban elérted a tartomány tetejét, megjelenik az **⬆ emelhetsz** jelzés.
- **Szerkesztés:** a nap fülén **✎ Szerkesztés** → gyakorlat módosítása, törlése, sorrend, új gyakorlat. Napokat a ⚙ fülön lehet hozzáadni, átnevezni, törölni.
- **Mentés fájlba:** ⚙ → Letöltés / Visszatöltés (JSON).
