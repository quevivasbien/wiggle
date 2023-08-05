import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, type User, type UserInfo, } from "firebase/auth";
import { auth } from './config';
import { user } from "$data/stores";

onAuthStateChanged(auth, (u) => {
    user.set(u);
});

export async function login(email: string, pass: string) {
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        return { error: null };
    }
    catch (error) {
        return { error };
    }
}

export async function register(uname: string, email: string, pass: string) {
    try {
        await createUserWithEmailAndPassword(auth, email, pass);
        updateProfile(auth.currentUser as User, {
            displayName: uname,
        });
        user.set(auth.currentUser);
        return { error: null };
    }
    catch (error) {
        return { error };
    }
}

export function logout() {
    signOut(auth);
}
