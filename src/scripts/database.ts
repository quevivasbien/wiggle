import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyA0HI902uNE_JVegCEzWpGuIISySC2cds4",
    authDomain: "wiggle-game.firebaseapp.com",
    databaseURL: "https://wiggle-game-default-rtdb.firebaseio.com",
    projectId: "wiggle-game",
    storageBucket: "wiggle-game.appspot.com",
    messagingSenderId: "296268705697",
    appId: "1:296268705697:web:e816842c9edfda8c52e5e0",
    measurementId: "G-5BGBKDSEGJ"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

// basic game data generated when lobby is created
// shared when joining lobby
export interface GameData {
    size: number;
    chars: string;
    minLength: number;
    creationTime: number;
    playersInLobby: number;
};

// data for active games
export interface ActiveGameData {
    size: number;
    chars: string;
    minLength: number;
    timeStarted: number;
    players?: string[]; // player ids of players currently in the game
    wordsFound?: Record<string, string[]>; // player id -> words found
}