import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import "https://cdn.jsdelivr.net/npm/localforage/dist/localforage.min.js";


// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDhhbDMuP-0aUWRTG7tk6-MdrnoTOKWW_k",
    authDomain: "alpha-ionix-project.firebaseapp.com",
    projectId: "alpha-ionix-project",
    storageBucket: "alpha-ionix-project.appspot.com",
    messagingSenderId: "732932003953",
    appId: "1:732932003953:web:c57f9a0b1270614089e3d0",
    measurementId: "G-GPG8N80PZ7"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

localforage.config({
    name: "AlphaIonix",
    storeName: "userDataStore"
});

// Save data to localForage
export async function saveData(key, data) {
    try {
        // Save to LocalForage
        await window.localforage.setItem(key, data);
        console.log(`✅ Data saved locally for key: ${key}`);

        // Save to Firestore (only if data is new or changed)
        const docRef = doc(db, "userContent", key);
        await setDoc(docRef, {
            content: data,
            timestamp: serverTimestamp()
        }, { merge: true });  // Ensures Firebase data is merged, not overwritten

        console.log(`☁️ Data synced to Firebase for key: ${key}`);
    } catch (error) {
        console.error("❌ Error saving data:", error);
    }
}

export async function loadData(key) {
    try {
        // Load from LocalForage first
        let data = await window.localforage.getItem(key);

        if (data !== null) {
            console.log(`✅ Loaded from LocalForage: ${key}`);
            return data;
        }

        // If not found locally, try Firebase
        const docRef = doc(db, "userContent", key);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            data = docSnap.data().content;
            console.log(`☁️ Loaded from Firebase: ${key}`);

            // Store it locally for next time
            await window.localforage.setItem(key, data);
            return data;
        }

        // If Firebase is empty, return `null` but **do not erase local data**
        console.log(`⚠️ No Firebase data found for key: ${key}. Keeping local data.`);
        return null;
    } catch (error) {
        console.error("❌ Error loading data:", error);
        return null;
    }
}

export function syncFirebaseToLocal(key) {
    const docRef = doc(db, "userContent", key);

    onSnapshot(docRef, async (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data().content;

            if (data !== null && data !== undefined) {
                console.log(`🔄 Firestore update detected for key: ${key}`);

                // Only update if it's a valid change
                const localData = await window.localforage.getItem(key);
                if (JSON.stringify(localData) !== JSON.stringify(data)) {
                    await window.localforage.setItem(key, data);
                    console.log(`✅ LocalForage updated from Firestore.`);
                } else {
                    console.log(`ℹ️ No change in Firestore data, LocalForage remains the same.`);
                }
            }
        } else {
            console.log(`⚠️ Firestore document for key: ${key} is missing. No changes made to LocalForage.`);
        }
    });
}









