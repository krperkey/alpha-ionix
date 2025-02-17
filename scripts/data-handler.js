import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


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
export async function saveData(key, newData) {
    try {
        // Load existing data from Firestore
        const docRef = doc(db, "userContent", key);
        const docSnap = await getDoc(docRef);
        let existingData = [];

        if (docSnap.exists()) {
            existingData = docSnap.data().content || [];
        }

        // Ensure the data is an array
        if (!Array.isArray(existingData)) {
            existingData = [];
        }

        // Append new entry
        existingData.push(newData);

        // Save back to Firestore
        await setDoc(docRef, { content: existingData, timestamp: serverTimestamp() }, { merge: true });

        console.log(`☁️ Data synced to Firebase for key: ${key}`);

        // Also store locally in LocalForage
        await localforage.setItem(key, existingData);
        console.log(`✅ Data saved locally for key: ${key}`);
    } catch (error) {
        console.error("❌ Error saving data:", error);
    }
}

export async function loadData(key) {
    try {
        // Load from LocalForage first
        let data = await localforage.getItem(key);

        if (data !== null) {
            console.log(`✅ Loaded from LocalForage: ${key}`, data);
            return data;
        }

        // If not found locally, try Firebase
        const docRef = doc(db, "userContent", key);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            data = docSnap.data().content || [];
            console.log(`☁️ Loaded from Firebase: ${key}`, data);

            // Store it locally for next time
            await localforage.setItem(key, data);
            return data;
        }

        console.warn(`⚠️ No Firebase data found for key: ${key}`);
        return [];
    } catch (error) {
        console.error("❌ Error loading data:", error);
        return [];
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









