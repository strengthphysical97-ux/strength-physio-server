let allCategories = {
    rehab: [],
    physio: [],
    imported: [],
    accessories: [],
    beautyandsliming: [],
    basic_setup:[]

};

// Global variable
window.allCategories = allCategories;

async function fetchAndInitialize() {
    try {
       const response = await fetch('https://strength-physio-server-1.onrender.com/api/products');
        const data = await response.json();
        
        allCategories.rehab = data.filter(p => p.category && p.category.toLowerCase() === 'rehab');
        allCategories.physio = data.filter(p => p.category && p.category.toLowerCase() === 'physio');
        allCategories.imported = data.filter(p => p.category && p.category.toLowerCase() === 'imported');
        allCategories.accessories = data.filter(p => p.category && p.category.toLowerCase() === 'accessories');
        allCategories.beautyandsliming = data.filter(p => p.category && p.category.toLowerCase() === 'beautyandsliming');
        allCategories.basic_setup = data.filter(p => p.category && p.category.toLowerCase() === 'basic_setup');
        
        console.log("Data loaded:", allCategories);

        // Yahan se event trigger karo
        window.dispatchEvent(new Event('dataReady'));
    } catch (error) {
        console.error("Data loading error:", error);
    }
}

// Page load hote hi data fetch karo
document.addEventListener('DOMContentLoaded', fetchAndInitialize);



