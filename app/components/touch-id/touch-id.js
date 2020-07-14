// @flow
import RNTouchId from 'react-native-touch-id'

export default RNTouchId

export const TouchId = {
  // TODO: Fix type of promise return value from here
  authenticate(message: string, callback: () => void): Promise<any> {
    return new Promise((resolve, reject) => {
      const config = {
        imageColor: '#ffffff00',
        imageErrorColor: '#ffffff00',
      }

      RNTouchId.authenticate(message, config)
        .then(resolve)
        .catch((error) => {
          if (error.name === 'LAErrorSystemCancel') {
            setTimeout(callback, 1000)
          }
          reject(error)
        })
    })
  },
  isSupported(): Promise<any> {
    return new Promise((resolve, reject) => {
      RNTouchId.isSupported()
        .then(resolve)
        .catch((error) => {
          reject(error)
        })
    })
  },
}
