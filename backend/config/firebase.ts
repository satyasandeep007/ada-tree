/* eslint-disable @typescript-eslint/no-explicit-any */
import * as admin from "firebase-admin";
import { credential } from "firebase-admin";

import serviceAccount from "./serviceAccountKey.json";

admin.initializeApp({
  credential: credential.cert(serviceAccount as any),
});

export const db = admin.firestore();
