import '../styles/globals.css'


import { FirebaseAppProvider } from 'reactfire';
const firebaseConfig = {
    apiKey: "AIzaSyApWya88YoBJ5-sBZ4x48mg_FJswKFrQn0",
    authDomain: "fomo-react-ts.firebaseapp.com",
    projectId: "fomo-react-ts",
    storageBucket: "fomo-react-ts.appspot.com",
    messagingSenderId: "449558273392",
    appId: "1:449558273392:web:71e0604e83edbf4364c3b5"
};

function MyApp({ Component, pageProps }) {
  return(
          <FirebaseAppProvider firebaseConfig={firebaseConfig}>
            <Component {...pageProps} />
          </FirebaseAppProvider>
      )


}

export default MyApp
