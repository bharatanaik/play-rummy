import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";


//  Firebase configuration
export const firebaseConfig = {
	apiKey: "AIzaSyCpRdmQq_k_ZrZ9Kc9m2FkUnLV0ubKRpTY",
	authDomain: "play-rummy-cb055.firebaseapp.com",
	databaseURL: "https://play-rummy-cb055-default-rtdb.firebaseio.com",
	projectId: "play-rummy-cb055",
	storageBucket: "play-rummy-cb055.firebasestorage.app",
	messagingSenderId: "122424183430",
	appId: "1:122424183430:web:78234a9754ab72b0421f07"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Real Time Database
const db = getDatabase(app);
// Initialize Auth
const auth = getAuth(app);
// Initialize Google Auth
const provider = new GoogleAuthProvider();

// If in development environment (localhost) then use emulator
if (location.hostname === "localhost") {
	console.log("Connecting to local firebase emulator");
	// connectDatabaseEmulator(db, "127.0.0.1", 9000);
	// connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
}

const signInWithGoogle = () => {
	signInWithPopup(auth, provider).then((res) => {
		console.log(res.user)
	}).catch((error) => {
		console.log(error.message)
	})
}

export { db, auth, provider, signInWithGoogle };
