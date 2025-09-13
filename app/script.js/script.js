import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Your Firebase configuration from Vercel Environment Variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to show a status message to the user
function showStatus(message, isError = false) {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = message;
    statusMessage.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');
    if (isError) {
        statusMessage.classList.add('bg-red-100', 'text-red-800');
    } else {
        statusMessage.classList.add('bg-green-100', 'text-green-800');
    }
    statusMessage.classList.remove('hidden');
}

// Function to handle form submission (Manual Report from ASHA worker)
document.getElementById('reportForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const reporterId = document.getElementById('reporterId').value;
    const location = document.getElementById('location').value;
    const diseaseType = document.getElementById('diseaseType').value;
    const caseCount = parseInt(document.getElementById('caseCount').value, 10);
    const waterSource = document.getElementById('waterSource').value;
    const turbidityLevel = parseFloat(document.getElementById('turbidityLevel').value) || null;
    const pHLevel = parseFloat(document.getElementById('pHLevel').value) || null;

    try {
        await addDoc(collection(db, `/artifacts/${firebaseConfig.appId}/public/data/diseaseReports`), {
            reporterId,
            location,
            diseaseType,
            caseCount,
            waterSource,
            turbidityLevel,
            pHLevel,
            source: 'Manual Report',
            timestamp: new Date()
        });
        showStatus("Report submitted successfully!", false);
        document.getElementById('reportForm').reset();
    } catch (e) {
        console.error("Error adding document: ", e);
        showStatus("Error submitting report. Please try again.", true);
    }
});

// Function to generate and submit dummy data
document.getElementById('generateDataBtn').addEventListener('click', async () => {
    const reports = [
        // Simulated Sensor data
        { location: 'Village A', diseaseType: 'N/A', caseCount: 0, pHLevel: 6.8, turbidityLevel: 90, source: 'Simulated Sensor' },
        { location: 'Village B', diseaseType: 'N/A', caseCount: 0, pHLevel: 7.2, turbidityLevel: 88, source: 'Simulated Sensor' },
        { location: 'Village C', diseaseType: 'N/A', caseCount: 0, pHLevel: 7.1, turbidityLevel: 110, source: 'Simulated Sensor' },
        { location: 'Village D', diseaseType: 'N/A', caseCount: 0, pHLevel: 7.8, turbidityLevel: 75, source: 'Simulated Sensor' },

        // Manual reports from ASHA workers
        { location: 'Village A', diseaseType: 'Typhoid', caseCount: 2, reporterId: 'ASHA_1', source: 'Manual Report' },
        { location: 'Village B', diseaseType: 'Diarrhea', caseCount: 3, reporterId: 'ASHA_2', source: 'Manual Report' },
        { location: 'Village C', diseaseType: 'Cholera', caseCount: 8, reporterId: 'ASHA_3', source: 'Manual Report' },
        { location: 'Village D', diseaseType: 'Hepatitis A', caseCount: 1, reporterId: 'ASHA_4', source: 'Manual Report' },
    ];

    try {
        showStatus("Generating dummy data...", false);
        const collectionRef = collection(db, `/artifacts/${firebaseConfig.appId}/public/data/diseaseReports`);
        
        for (const report of reports) {
            await addDoc(collectionRef, { ...report, timestamp: new Date() });
        }
        
        showStatus("Dummy data generated successfully!", false);
        console.log("Dummy data generated successfully!");
    } catch (e) {
        console.error("Error generating dummy data: ", e);
        showStatus("Error generating dummy data. Please check the console.", true);
    }
});
