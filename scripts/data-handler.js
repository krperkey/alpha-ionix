import localforage from "https://cdn.jsdelivr.net/npm/localforage/dist/localforage.min.js";

// Initialize localForage
localforage.config({
    name: "AlphaIonix",
    storeName: "userDataStore"
});

// Save data to localForage
export async function saveData(key, data) {
    try {
        await localforage.setItem(key, data);
        console.log(`Data saved for key: ${key}`);
    } catch (error) {
        console.error("Error saving data:", error);
    }
}

// Load data from localForage
export async function loadData(key) {
    try {
        const data = await localforage.getItem(key);
        console.log(`Data loaded for key: ${key}`, data);
        return data;
    } catch (error) {
        console.error("Error loading data:", error);
        return null;
    }
}
