import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export async function saveTextbeeSettings({ apiKey, deviceId }) {
  await setDoc(doc(db, 'settings', 'textbee'), {
    apiKey: apiKey.trim(),
    deviceId: deviceId.trim(),
    updatedAt: serverTimestamp(),
  })
}
