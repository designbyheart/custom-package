// @flow

import { Apptentive, ApptentiveConfiguration } from 'apptentive-react-native'
import { apptentiveCredentials } from './message-constants'
import { customLogger } from '../store/custom-logger'

const configuration = new ApptentiveConfiguration(
  apptentiveCredentials.apptentiveKey,
  apptentiveCredentials.apptentiveSignature
)

export const setupFeedback = ApptentiveMessage()

function ApptentiveMessage() {
  if (__DEV__) configuration.logLevel = 'verbose'
  Apptentive.register(configuration)
    .then(() => {
      Apptentive.onAuthenticationFailed = reason => {
        if (__DEV__) {
          customLogger.log('Error', `Authentication failed:\n${reason}`)
        }
      }
    })
    .catch(error => {
      if (__DEV__) {
        customLogger.log(
          'Error',
          `Can't register Apptentive:\n${error.message}`
        )
      }
    })
}
