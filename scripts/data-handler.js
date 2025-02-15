import "https://cdn.jsdelivr.net/npm/localforage/dist/localforage.min.js";

// Ensure localForage is properly initialized
window.localforage.config({
    name: "AlphaIonix",
    storeName: "userDataStore"
});

// Save data to localForage
export async function saveData(key, data) {
    try {
        await window.localforage.setItem(key, data);
        console.log(`Data saved for key: ${key}`);
    } catch (error) {
        console.error("Error saving data:", error);
    }
}

export async function loadData(key) {
    try {
        const data = await window.localforage.getItem(key);
        if (key.startsWith("savedBatchResults-")) {
            return Array.isArray(data) ? data : [];  // Ensure it's always an array for batch results
        }
        return data !== null ? data : {};
    } catch (error) {
        console.error("❌ Error loading data:", error);
        return key.startsWith("savedBatchResults-") ? [] : {};
    }
}





