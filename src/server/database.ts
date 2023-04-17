import { env } from "$env/dynamic/private";

import { initializeApp, type FirebaseOptions } from 'firebase/app';
import { getDatabase } from 'firebase/database';

function setupDatabase(firebaseConfig: FirebaseOptions) {
    const app = initializeApp(firebaseConfig);
    return getDatabase(app);
}

const firebaseConfig = {
    databaseURL: env.DATABASE_URL,
};

export const database = setupDatabase(firebaseConfig);