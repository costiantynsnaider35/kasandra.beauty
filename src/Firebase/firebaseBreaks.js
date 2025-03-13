import { db } from "./firebaseConfig.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import toast from "react-hot-toast";

export const getBreaks = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "breaks"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch {
    return [];
  }
};

export const addBreak = async (breakTime) => {
  try {
    const docRef = await addDoc(collection(db, "breaks"), breakTime);
    toast.success;
    return { id: docRef.id, ...breakTime };
  } catch (error) {
    toast.Error;
    throw new Error(error.message);
  }
};

export const deleteBreak = async (breakId) => {
  try {
    const breakRef = doc(db, "breaks", breakId);
    await deleteDoc(breakRef);
    toast.success;
  } catch (error) {
    toast.error;
    throw new Error(error.message);
  }
};
