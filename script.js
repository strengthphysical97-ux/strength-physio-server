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

        const cachedData = localStorage.getItem('products');

        if (cachedData) {
            processProducts(JSON.parse(cachedData));
        }

        const response = await fetch('https://strength-physio-server-1.onrender.com/api/products');

        const data = await response.json();

        localStorage.setItem('products', JSON.stringify(data));

        processProducts(data);

    } catch (error) {
        console.error("Data loading error:", error);
    }
}

function processProducts(data) {

    allCategories.rehab = data.filter(p => p.category?.toLowerCase() === 'rehab');
    allCategories.physio = data.filter(p => p.category?.toLowerCase() === 'physio');
    allCategories.imported = data.filter(p => p.category?.toLowerCase() === 'imported');
    allCategories.accessories = data.filter(p => p.category?.toLowerCase() === 'accessories');
    allCategories.beautyandsliming = data.filter(p => p.category?.toLowerCase() === 'beautyandsliming');
    allCategories.basic_setup = data.filter(p => p.category?.toLowerCase() === 'basic_setup');

    window.dispatchEvent(new Event('dataReady'));
}


