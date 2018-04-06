import { Platform } from 'react-native'

export const apptentiveCredentials = Platform.select({
  ios: {
    apptentiveKey: 'IOS-EVERNYM-ee7e2325084e',
    apptentiveSignature: '8049eba0f656a5b7aeb9722b84e5ec54',
  },
  android: {
    apptentiveKey: '<YOUR_ANDROID_APPTENTIVE_KEY>',
    apptentiveSignature: '<YOUR_ANDROID_APPTENTIVE_SIGNATURE>',
  },
})
