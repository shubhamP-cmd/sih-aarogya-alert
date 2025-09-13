import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const appId = "default-app-id"; // This will be overwritten by Vercel environment variable during deployment

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const form = document.getElementById('reportForm');
const statusMessage = document.getElementById('statusMessage');
const languageSwitcher = document.getElementById('language-switcher');
const submitButton = document.getElementById('submitButton');
const mainTitle = document.getElementById('app-title');
const subtitle = document.getElementById('app-subtitle');

const translations = {
    'English': {
        title: 'Report New Cases',
        subtitle: 'For ASHA workers and community volunteers',
        locationLabel: 'Location / Village',
        diseaseLabel: 'Disease Type',
        casesLabel: 'Number of Cases',
        submit: 'Submit Report',
        success: 'Report Submitted Successfully!',
        error: 'Failed to submit report. Please try again.'
    },
    'हिन्दी': {
        title: 'नए मामले दर्ज करें',
        subtitle: 'आशा कार्यकर्ताओं और सामुदायिक स्वयंसेवकों के लिए',
        locationLabel: 'स्थान / गाँव',
        diseaseLabel: 'रोग का प्रकार',
        casesLabel: 'मामलों की संख्या',
        submit: 'रिपोर्ट जमा करें',
        success: 'रिपोर्ट सफलतापूर्वक जमा हो गई!',
        error: 'रिपोर्ट जमा करने में विफल। कृपया पुन: प्रयास करें।'
    }
};

let currentLanguage = 'English';

function updateLanguage(lang) {
    currentLanguage = lang;
    const t = translations[currentLanguage];
    if (t) {
        mainTitle.textContent = t.title;
        subtitle.textContent = t.subtitle;
        document.getElementById('location-label').textContent = t.locationLabel;
        document.getElementById('disease-label').textContent = t.diseaseLabel;
        document.getElementById('cases-label').textContent = t.casesLabel;
        submitButton.textContent = t.submit;
        document.getElementById('location').placeholder = t.locationLabel;
    }
}

languageSwitcher.addEventListener('change', (e) => {
    updateLanguage(e.target.value);
});

updateLanguage(currentLanguage);

// Core form submission logic for ASHA workers
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const location = document.getElementById('location').value;
    const diseaseType = document.getElementById('disease').value;
    const caseCount = parseInt(document.getElementById('cases').value, 10);

    // Basic input validation
    if (!location || !diseaseType || isNaN(caseCount) || caseCount <= 0) {
        statusMessage.textContent = 'Please fill out all fields with valid data.';
        statusMessage.className = 'text-center text-red-500 mt-4';
        return;
    }

    try {
        const dataCollectionPath = `/artifacts/${appId}/public/data/diseaseReports`;
        await addDoc(collection(db, dataCollectionPath), {
            location: location,
            diseaseType: diseaseType,
            caseCount: caseCount,
            timestamp: new Date(),
            source: 'Manual Report'
        });
        statusMessage.textContent = translations[currentLanguage].success;
        statusMessage.className = 'text-center text-green-500 mt-4';
        form.reset();
    } catch (e) {
        console.error("Error adding document: ", e);
        statusMessage.textContent = translations[currentLanguage].error;
        statusMessage.className = 'text-center text-red-500 mt-4';
    }
});


// ----- DUMMY DATA GENERATOR FOR HACKATHON DEMO -----
// This function simulates data from both sensors and manual reports.
// You will run this in your browser's developer console to populate your database.
window.generateDummyData = async () => {
    const dataCollectionPath = `/artifacts/${appId}/public/data/diseaseReports`;
    const dummyReports = [
        // Simulated sensor data
        { location: 'Village A', diseaseType: 'N/A', caseCount: 0, pHLevel: 6.8, turbidityLevel: 90, EcoliCount: 50, source: 'Simulated Sensor', timestamp: new Date(Date.now() - 3600000) },
        { location: 'Village B', diseaseType: 'N/A', caseCount: 0, pHLevel: 7.2, turbidityLevel: 80, EcoliCount: 45, source: 'Simulated Sensor', timestamp: new Date(Date.now() - 3000000) },
        { location: 'Village C', diseaseType: 'N/A', caseCount: 0, pHLevel: 7.1, turbidityLevel: 110, EcoliCount: 150, source: 'Simulated Sensor', timestamp: new Date(Date.now() - 2400000) }, // This will trigger an alert
        { location: 'Village D', diseaseType: 'N/A', caseCount: 0, pHLevel: 7.0, turbidityLevel: 75, EcoliCount: 30, source: 'Simulated Sensor', timestamp: new Date(Date.now() - 1800000) },

        // Manual reports from ASHA workers
        { location: 'Village A', diseaseType: 'Typhoid', caseCount: 2, reporterId: 'ASHA_1', source: 'Manual Report', timestamp: new Date(Date.now() - 1200000) },
        { location: 'Village B', diseaseType: 'Diarrhea', caseCount: 3, reporterId: 'ASHA_2', source: 'Manual Report', timestamp: new Date(Date.now() - 600000) },
        { location: 'Village C', diseaseType: 'Cholera', caseCount: 6, reporterId: 'ASHA_3', source: 'Manual Report', timestamp: new Date() }, // This will also trigger an alert
    ];

    console.log("Generating dummy data...");
    for (const report of dummyReports) {
        await addDoc(collection(db, dataCollectionPath), report);
    }
    console.log("Dummy data generated successfully.");
};
