import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import { useEffect, useRef, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyApWya88YoBJ5-sBZ4x48mg_FJswKFrQn0",
    authDomain: "fomo-react-ts.firebaseapp.com",
    projectId: "fomo-react-ts",
    storageBucket: "fomo-react-ts.appspot.com",
    messagingSenderId: "449558273392",
    appId: "1:449558273392:web:71e0604e83edbf4364c3b5"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
    const [user] = useAuthState(auth);
    return (
        <div className="min-h-screen grid place-items-center">
            {user ? <SendInvites user={user}/> : <SignUp/>}
        </div>
    );
}

function SignUp() {
    const[recaptcha, setRecaptcha] = useState(null)
    const element = useRef(null)
    useEffect(()=>{
        if (!recaptcha) {

            const verifier = new firebase.auth.RecaptchaVerifier(element.current, {
                size: 'invisible',
            })

            verifier.verify().then(() => setRecaptcha(verifier));

        }
    })
    return(
        <>

            {recaptcha && <PhoneNumberVerification recaptcha={recaptcha} />}
                <div ref={element}></div>

        </>
    )

}

function PhoneNumberVerification({ recaptcha }) {
    const [digits, setDigits] = useState('');
    const [invited, setInvited] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [code, setCode] = useState('');

    const phoneNumber = `+1${digits}`;

    // Step 1 - Verify Invite
    useEffect(() => {
        if (phoneNumber.length === 12) {
            const ref = firestore.collection('invites').doc(phoneNumber);
            ref.get().then(({ exists }) => { setInvited(exists) });
        } else {
            setInvited(false);
        }
    }, [phoneNumber]);

    // Step 2 - Sign in
    const signInWithPhoneNumber = async () => {
        setConfirmationResult( await auth.signInWithPhoneNumber(phoneNumber, recaptcha) );
    };

    // Step 3 - Verify SMS code
    const verifyCode = async () => {
        const result = await confirmationResult.confirm(code);
        console.log(result.user);
    };

    return (
        <div className="p-20 rounded-xl bg-blue-500 text-white text-2xl border-2 border-black">
            <h1 className="text-4xl mb-3.5">Registrace</h1>
            <fieldset>
                <label>Vaše telefoní číslo</label>
                <br />
                <input  value={digits} onChange={(e) => setDigits(e.target.value)} className="border-2 border-black rounded-xl mt-3.5 text-xl text-black p-2" />

                <button  className="border-2 border-black bg-white rounded-xl ml-3 text-black text-xl p-2" onClick={signInWithPhoneNumber} >
                   Registrace
                </button>

                {invited ?
                    <p className="mt-3.5">Teď jsi frecoolín! 👋</p> :
                    <p className="mt-3.5">Neplatné telefoní číslo 😞</p>

                }
            </fieldset>

            {confirmationResult && (
                <fieldset>
                    <label>Verify code</label>
                    <br />
                    <input value={code} onChange={(e) => setCode(e.target.value)} />

                    <button onClick={verifyCode}>Verify Code</button>
                </fieldset>
            )}
        </div>
    );
}
function SendInvites({ user }) {
    const query = firestore.collection('invites').where('sender', '==', user.uid);
    const [invites] = useCollectionData(query);

    const [digits, setDigits] = useState('');
    const phoneNumber = `+1${digits}`;

    const sendInvite = async () => {
        const inviteRef = firestore.collection('invites').doc(phoneNumber);
        await inviteRef.set({
            phoneNumber,
            sender: user.uid,
        });
    };
    return (
        <div className="p-20 rounded-xl bg-blue-500 text-white text-2xl">
            <h1>Invite your BFFs</h1>
            {invites?.map((data) => (
                <p>You invited {data?.phoneNumber}</p>
            ))}

            {invites?.length < 2 && (
                <>
                    <input  value={digits} onChange={(e) => setDigits(e.target.value)} />
                    <button onClick={sendInvite}>Send Invite</button>
                </>
            )}

            <button onClick={() => auth.signOut()}>Sign Out</button>
        </div>
    );
}

export default App;