'use client'
import { useState, useReducer, useRef, useEffect } from 'react';

// --- Firebase Imports ---
// You will need to install firebase: npm install firebase
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, limit, getDocs } from 'firebase/firestore';

// --- Firebase Configuration ---
// NOTE: Replace this with your actual Firebase project configuration
// It is safe to expose this in client-side code.
const firebaseConfig = {
  apiKey: "AIzaSyA30rqFym17ih3z6nPyDyzLXwsQ4Da6_TQ",
  authDomain: "farm-ai-907d6.firebaseapp.com",
  projectId: "farm-ai-907d6",
  storageBucket: "farm-ai-907d6.firebasestorage.app",
  messagingSenderId: "1009731524211",
  appId: "1:1009731524211:web:17003d42599aa802757c06",
  measurementId: "G-R3VZFT8ENH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// --- ICONS ---
const CameraIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const LeafIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M15.5,14.5c0,4-3.5,9-7.5,9s-7.5-5-7.5-9s3.5-9,7.5-9S15.5,10.5,15.5,14.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M8,23V12c0,0,4-1,4-4" /></svg>);
const LoadingSpinner = () => (<svg className="animate-spin h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);
const HistoryIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const SaveIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3l-4 4-4-4z" /></svg>);
const GoogleIcon = () => (<svg className="h-6 w-6 mr-3" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,36.218,44,30.668,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>);

// --- LANGUAGE TRANSLATIONS ---
const translations = {
  en: { appName: "Crop Doc", appDescription: "Quickly identify plant diseases from a single leaf.", scanButton: "SCAN PLANT LEAF", historyButton: "View Scan History", analyzing: "Analyzing your leaf...", analyzingSub: "Our AI is checking for potential diseases.", status: "STATUS", diseased: "DISEASED", healthy: "HEALTHY", confidence: "CONFIDENCE", aboutSymptoms: "About & Symptoms", treatment: "Treatment", cause: "Cause", symptoms: "Symptoms", organicTreatment: "Organic Treatment", chemicalTreatment: "Chemical Treatment", scanAnother: "Scan Another Leaf", analysisFailed: "Analysis Failed", tryAgain: "Try Again", scanHistory: "Scan History", noHistory: "Your saved scans will appear here.", back: "Back", loginTitle: "Welcome to Crop Doc", loginSub: "Sign in with your Google account to save your scan history.", loginButton: "Sign In with Google", saveButton: "Save to History", saved: "Saved!", storageFull: "Storage is full (10 scans max).", yourId: "Signed in as:" },
  hi: { appName: "क्रॉप डॉक्टर", appDescription: "एक ही पत्ते से पौधों की बीमारियों की तुरंत पहचान करें।", scanButton: "पत्ते को स्कैन करें", historyButton: "स्कैन इतिहास देखें", analyzing: "आपके पत्ते का विश्लेषण हो रहा है...", analyzingSub: "हमारा AI संभावित बीमारियों की जाँच कर रहा है।", status: "स्थिति", diseased: "रोगग्रस्त", healthy: "स्वस्थ", confidence: "आत्मविश्वास", aboutSymptoms: "बीमारी और लक्षण", treatment: "इलाज", cause: "कारण", symptoms: "लक्षण", organicTreatment: "जैविक उपचार", chemicalTreatment: "रासायनिक उपचार", scanAnother: "दूसरा पत्ता स्कैन करें", analysisFailed: "विश्लेषण विफल", tryAgain: "पुनः प्रयास करें", scanHistory: "स्कैन इतिहास", noHistory: "आपके सहेजे गए स्कैन यहां दिखाई देंगे।", back: "वापस", loginTitle: "क्रॉप डॉक्टर में आपका स्वागत है", loginSub: "अपना स्कैन इतिहास सहेजने के लिए अपने Google खाते से साइन इन करें।", loginButton: "Google से साइन इन करें", saveButton: "इतिहास में सहेजें", saved: "सहेज लिया!", storageFull: "स्टोरेज भर गया है (अधिकतम 10 स्कैन)।", yourId: "इस रूप में साइन इन हैं:" }
};

// --- MOCK API DATA & DISEASE DATABASE (Structure remains the same) ---
const mockApiData = { diseased: { prediction: "Diseased", confidence: 0.92, disease_key: "tomato_late_blight" }, healthy: { prediction: "Healthy", confidence: 0.98, disease_key: null } };
const diseaseDatabase = { en: { tomato_late_blight: { name: "Tomato Late Blight", cause: "Caused by Phytophthora infestans.", symptoms: "Dark, water-soaked spots on leaves.", treatment: { organic: "Remove infected plants.", chemical: "Apply fungicides." } } }, hi: { tomato_late_blight: { name: "टमाटर का पछेती झुलसा", cause: "फाइटोफ्थोरा इन्फेस्टैन्स के कारण होता है।", symptoms: "पत्तियों पर गहरे, पानी वाले धब्बे।", treatment: { organic: "संक्रमित पौधों को हटा दें।", chemical: "कवकनाशी लागू करें।" } } } };

// --- APP STATE MANAGEMENT ---
const initialState = { status: 'login', user: null, result: null, imagePreview: null, error: null, history: [], isSaving: false, saveMessage: '' };

function appReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS': return { ...state, status: 'idle', user: action.payload };
    case 'LOGOUT': return { ...initialState };
    case 'START_ANALYSIS': return { ...state, status: 'loading', imagePreview: action.payload.imagePreview, saveMessage: '' };
    case 'ANALYSIS_SUCCESS': return { ...state, status: 'success', result: action.payload.result, imagePreview: action.payload.imagePreview };
    case 'ANALYSIS_ERROR': return { ...state, status: 'error', error: action.payload.error };
    case 'LOAD_HISTORY': return { ...state, history: action.payload };
    case 'VIEW_HISTORY': return { ...state, status: 'history' };
    case 'VIEW_HISTORY_DETAIL': return { ...state, status: 'success', result: action.payload.result, imagePreview: action.payload.imagePreview };
    case 'SAVING_START': return { ...state, isSaving: true, saveMessage: '' };
    case 'SAVING_COMPLETE': return { ...state, isSaving: false, saveMessage: action.payload };
    case 'RESET': return { ...state, status: 'idle', result: null, imagePreview: null, error: null, saveMessage: '' };
    default: throw new Error("Unknown action type");
  }
}

// --- UTILITY to convert file to Base64 ---
const toBase64 = file => new Promise((resolve, reject) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = () => resolve(reader.result); reader.onerror = error => reject(error); });

// --- UI COMPONENTS ---

const LanguageSwitcher = ({ language, setLanguage }) => (<div className="absolute top-4 right-4 z-10"><button onClick={() => setLanguage('en')} className={`px-3 py-1 text-sm font-bold rounded-l-md ${language === 'en' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}>EN</button><button onClick={() => setLanguage('hi')} className={`px-3 py-1 text-sm font-bold rounded-r-md ${language === 'hi' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}>HI</button></div>);

const LoginScreen = ({ t, onLogin }) => (
  <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full">
    <LeafIcon />
    <h1 className="text-3xl font-bold text-gray-800 mt-4">{t.loginTitle}</h1>
    <p className="text-gray-600 mt-2 mb-8">{t.loginSub}</p>
    <button
      onClick={onLogin}
      className="w-full bg-white text-gray-700 font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-100 transition-colors border border-gray-300 flex items-center justify-center"
    >
      <GoogleIcon />
      {t.loginButton}
    </button>
  </div>
);

const StartScreen = ({ onScan, onShowHistory, t, user }) => {
  const fileInputRef = useRef(null);
  const handleButtonClick = () => fileInputRef.current.click();
  return (
    <div className="text-center">
      <LeafIcon />
      <h1 className="text-4xl font-bold text-gray-800 mt-4">{t.appName}</h1>
      <p className="text-gray-600 mt-2 mb-8 max-w-xs mx-auto">{t.appDescription}</p>
      <input type="file" accept="image/*" capture="environment" onChange={onScan} className="hidden" ref={fileInputRef} />
      <button onClick={handleButtonClick} className="w-full max-w-xs bg-green-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105 flex items-center justify-center mx-auto"><CameraIcon /><span>{t.scanButton}</span></button>
      <button onClick={onShowHistory} className="mt-4 text-gray-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center mx-auto"><HistoryIcon />{t.historyButton}</button>
      <div className="mt-8 text-xs text-gray-400">
        <p>{t.yourId}</p>
        <p className="font-semibold text-gray-500 break-all">{user.displayName || user.email}</p>
      </div>
    </div>
  );
};

const LoadingScreen = ({ t }) => (<div className="flex flex-col items-center justify-center text-center text-white"><LoadingSpinner /><h2 className="text-2xl font-semibold mt-6">{t.analyzing}</h2><p className="mt-2 opacity-80">{t.analyzingSub}</p></div>);

const ResultScreen = ({ imagePreview, result, onReset, onSave, t, language, isSaving, saveMessage }) => {
  const [activeTab, setActiveTab] = useState('about');
  const isHealthy = result.prediction === 'Healthy';
  const diseaseInfo = !isHealthy ? diseaseDatabase[language][result.disease_key] : null;
  const confidencePercentage = (result.confidence * 100).toFixed(0);
  const statusBgColor = isHealthy ? 'bg-green-100' : 'bg-red-100';
  const statusTextColor = isHealthy ? 'text-green-800' : 'text-red-800';
  const statusRingColor = isHealthy ? 'ring-green-300' : 'ring-red-300';
  const confidenceBarColor = isHealthy ? 'bg-green-500' : 'bg-red-500';

  const SaveButton = () => (
    <div className="mt-4">
      {saveMessage ? (
        <p className={`text-center font-bold ${saveMessage.includes('full') || saveMessage.includes('पूर्ण') ? 'text-red-600' : 'text-green-600'}`}>{saveMessage}</p>
      ) : (
        <button onClick={onSave} disabled={isSaving} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:bg-gray-400">
          {isSaving ? <LoadingSpinner /> : <><SaveIcon /> {t.saveButton}</>}
        </button>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      <img src={imagePreview} alt="Scanned leaf" className="w-full h-56 object-cover" />
      <div className="p-5">
        <div className={`p-3 rounded-lg flex items-center justify-between ${statusBgColor} ring-2 ${statusRingColor}`}><div><p className={`text-sm font-medium ${statusTextColor} opacity-70`}>{t.status}</p><p className={`text-2xl font-bold ${statusTextColor}`}>{isHealthy ? t.healthy : t.diseased}</p></div><div className={`text-4xl font-bold ${statusTextColor}`}>{isHealthy ? '✅' : '❗️'}</div></div>
        <div className="mt-4"><p className="text-sm font-medium text-gray-500 mb-1">{t.confidence}</p><div className="w-full bg-gray-200 rounded-full h-2.5"><div className={`${confidenceBarColor} h-2.5 rounded-full`} style={{ width: `${confidencePercentage}%` }}></div></div><p className="text-right text-sm font-semibold text-gray-700 mt-1">{confidencePercentage}%</p></div>
        {!isHealthy && diseaseInfo && (
          <div className="mt-5"><h3 className="text-xl font-bold text-gray-800">{diseaseInfo.name}</h3><div className="border-b border-gray-200 mt-4"><nav className="-mb-px flex space-x-6"><button onClick={() => setActiveTab('about')} className={`${activeTab === 'about' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>{t.aboutSymptoms}</button><button onClick={() => setActiveTab('treatment')} className={`${activeTab === 'treatment' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>{t.treatment}</button></nav></div>
            <div className="pt-5 pb-2 text-gray-600 text-sm leading-relaxed">{activeTab === 'about' ? (<div><h4 className="font-bold text-gray-700 mb-1">{t.cause}</h4><p>{diseaseInfo.cause}</p><h4 className="font-bold text-gray-700 mt-4 mb-1">{t.symptoms}</h4><p>{diseaseInfo.symptoms}</p></div>) : (<div><h4 className="font-bold text-gray-700 mb-1">{t.organicTreatment}</h4><p>{diseaseInfo.treatment.organic}</p><h4 className="font-bold text-gray-700 mt-4 mb-1">{t.chemicalTreatment}</h4><p>{diseaseInfo.treatment.chemical}</p></div>)}</div>
          </div>
        )}
        <SaveButton />
      </div>
      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100"><button onClick={onReset} className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors">{t.scanAnother}</button></div>
    </div>
  );
};

const HistoryScreen = ({ history, onSelect, onBack, t, language }) => (<div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-5"><h2 className="text-2xl font-bold text-gray-800 mb-4">{t.scanHistory}</h2>{history.length === 0 ? (<p className="text-gray-500 text-center py-8">{t.noHistory}</p>) : (<ul className="space-y-3 max-h-[60vh] overflow-y-auto">{history.map((item) => { const diseaseName = item.result.prediction === 'Healthy' ? t.healthy : diseaseDatabase[language][item.result.disease_key]?.name || t.diseased; return (<li key={item.id} onClick={() => onSelect(item)} className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"><img src={item.imagePreview} alt="Scanned leaf" className="w-16 h-16 object-cover rounded-md mr-4" /><div className="flex-grow"><p className="font-bold text-gray-800">{diseaseName}</p><p className="text-sm text-gray-500">{new Date(item.timestamp).toLocaleDateString()}</p></div><span className="text-gray-400">&gt;</span></li>); })}</ul>)}<button onClick={onBack} className="mt-6 w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors">{t.back}</button></div>);

// --- MAIN PAGE COMPONENT ---
export default function HomePage() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [language, setLanguage] = useState('en');
  const t = translations[language];

  // --- Auth and Data Listener Effect ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      if (user) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        const scansCollection = collection(db, 'users', user.uid, 'scans');
        const q = query(scansCollection); // You can add orderBy here if you add a timestamp
        const unsubscribeSnapshot = onSnapshot(q, snapshot => {
          const historyData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          dispatch({ type: 'LOAD_HISTORY', payload: historyData });
        }, (error) => {
          console.error("Firestore snapshot error:", error);
        });
        return () => unsubscribeSnapshot(); // Cleanup snapshot listener
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    });
    return () => unsubscribeAuth(); // Cleanup auth listener
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle the user state update
    } catch (error) {
      console.error("Google sign-in failed", error);
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const imagePreviewUrl = await toBase64(file);
    dispatch({ type: 'START_ANALYSIS', payload: { imagePreview: imagePreviewUrl } });
    setTimeout(() => {
      const mockResult = Math.random() > 0.5 ? mockApiData.diseased : mockApiData.healthy;
      dispatch({ type: 'ANALYSIS_SUCCESS', payload: { result: mockResult, imagePreview: imagePreviewUrl } });
    }, 2000);
  };

  const handleSave = async () => {
    dispatch({ type: 'SAVING_START' });
    const scansCollection = collection(db, 'users', state.user.uid, 'scans');

    // Check storage limit
    if (state.history.length >= 10) {
      dispatch({ type: 'SAVING_COMPLETE', payload: t.storageFull });
      return;
    }

    // Save to Firestore
    try {
      await addDoc(scansCollection, {
        result: state.result,
        imagePreview: state.imagePreview, // Note: Storing base64 in DB is not ideal for large scale
        timestamp: new Date().getTime(),
      });
      dispatch({ type: 'SAVING_COMPLETE', payload: t.saved });
    } catch (error) {
      console.error("Error saving to Firestore:", error);
      dispatch({ type: 'SAVING_COMPLETE', payload: "Failed to save." });
    }
  };

  const handleReset = () => dispatch({ type: 'RESET' });
  const handleShowHistory = () => dispatch({ type: 'VIEW_HISTORY' });
  const handleHistorySelect = (item) => dispatch({ type: 'VIEW_HISTORY_DETAIL', payload: item });

  const renderContent = () => {
    switch (state.status) {
      case 'login': return <LoginScreen t={t} onLogin={handleLogin} />;
      case 'idle': return <StartScreen onScan={handleImageChange} onShowHistory={handleShowHistory} t={t} user={state.user} />;
      case 'loading': return <LoadingScreen t={t} />;
      case 'success': return <ResultScreen imagePreview={state.imagePreview} result={state.result} onReset={handleReset} onSave={handleSave} t={t} language={language} isSaving={state.isSaving} saveMessage={state.saveMessage} />;
      case 'history': return <HistoryScreen history={state.history} onSelect={handleHistorySelect} onBack={handleReset} t={t} language={language} />;
      case 'error': return (<div className="text-center text-red-800 bg-red-100 p-8 rounded-lg shadow-lg"><h2 className="text-2xl font-bold mb-2">{t.analysisFailed}</h2><p className="mb-6">{state.error || "An unknown error occurred."}</p><button onClick={handleReset} className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700">{t.tryAgain}</button></div>);
      default: return <LoginScreen t={t} onLogin={handleLogin} />;
    }
  };

  const bgColor = state.status === 'loading' || state.status === 'login' ? 'bg-gray-800' : 'bg-gray-100';

  return (<main className={`flex flex-col items-center justify-center min-h-screen p-4 transition-colors duration-500 relative ${bgColor}`}><LanguageSwitcher language={language} setLanguage={setLanguage} />{renderContent()}</main>);
}

