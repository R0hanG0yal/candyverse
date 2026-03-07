# 🔥 Firebase Setup — 5 Minutes, Free Forever

## Step 1 — Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Add project" → name it "candyverse" → click Continue → Create project

## Step 2 — Create Realtime Database
1. In left sidebar click "Realtime Database" → "Create database"
2. Choose location (asia-south1 for India)
3. Start in **Test mode** (allows all reads/writes) → Enable

## Step 3 — Get Your Config
1. Click the gear icon ⚙️ → "Project settings"
2. Scroll down to "Your apps" → click the </> (Web) icon
3. Register app name "candyverse" → click Register
4. Copy the firebaseConfig object — looks like this:
```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "candyverse-abc.firebaseapp.com",
  databaseURL: "https://candyverse-abc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "candyverse-abc",
  storageBucket: "candyverse-abc.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 4 — Paste Config into cv-db.js
Open `public/cv-db.js` and replace the CV_FIREBASE_CONFIG section with your values:
```js
var CV_FIREBASE_CONFIG = {
  apiKey:            "AIzaSy...",         // ← paste yours
  authDomain:        "candyverse-abc...", // ← paste yours
  databaseURL:       "https://cand...",   // ← paste yours (IMPORTANT!)
  projectId:         "candyverse-abc",    // ← paste yours
  storageBucket:     "candyverse-abc...", // ← paste yours
  messagingSenderId: "123456789",         // ← paste yours
  appId:             "1:123..."           // ← paste yours
};
```

## Step 5 — Push to GitHub & Redeploy
```bash
git add .
git commit -m "add Firebase - cross-device orders"
git push
```
Render auto-redeploys in ~1 minute. Done! ✅

## What happens now
- Customer places order on their phone → saved to Firebase instantly
- Admin dashboard on your laptop → shows the order in real-time 🔥
- Order tracker updates live across all devices
- All orders persist forever (not lost on page refresh)
