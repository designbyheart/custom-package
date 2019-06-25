//@flow
import RNFetchBlob from 'rn-fetch-blob'
import uniqueId from 'react-native-unique-id'
import _flatten from 'lodash.flatten'
import _merge from 'lodash.merge'

import {
  setVcxLogger,
  writeToVcxLog,
  encryptVcxLog,
} from '../bridge/react-native-cxs/RNCxs'
import type { Dispatch } from 'redux'
import type { Store } from '../store/type-store'
import { UPDATE_LOG_ISENCRYPTED } from '../send-logs/type-send-logs'
import {
  CLAIM_RECEIVED,
  CLAIM_RECEIVED_VCX,
  MAP_CLAIM_TO_SENDER,
} from '../claim/type-claim'
import { GENERATE_RECOVERY_PHRASE_SUCCESS } from '../backup/type-backup'
import {
  DELETE_CONNECTION_SUCCESS,
  NEW_CONNECTION,
  DELETE_CONNECTION_FAILURE,
  DELETE_CONNECTION,
} from './type-connection-store'
import { NEW_CONNECTION_SUCCESS } from './new-connection-success'
import { HYDRATE_CONNECTIONS } from './connections-store'
import {
  CLAIM_OFFER_RECEIVED,
  SEND_CLAIM_REQUEST,
  SEND_CLAIM_REQUEST_SUCCESS,
  SEND_PAID_CREDENTIAL_REQUEST,
  ADD_SERIALIZED_CLAIM_OFFER,
  HYDRATE_CLAIM_OFFERS_SUCCESS,
} from '../claim-offer/type-claim-offer'
import {
  DEEP_LINK_DATA,
  DEEP_LINK_PROCESSED,
} from '../deep-link/type-deep-link'
import {
  LOAD_HISTORY_SUCCESS,
  RECORD_HISTORY_EVENT,
  DELETE_HISTORY_EVENT,
  HISTORY_EVENT_OCCURRED,
} from '../connection-history/type-connection-history'
import {
  ONFIDO_CONNECTION_ESTABLISHED,
  HYDRATE_ONFIDO_APPLICANT_ID_SUCCESS,
  HYDRATE_ONFIDO_DID_SUCCESS,
  UPDATE_ONFIDO_APPLICANT_ID,
} from '../onfido/type-onfido'
import {
  UPDATE_ATTRIBUTE_CLAIM,
  PROOF_SUCCESS,
  USER_SELF_ATTESTED_ATTRIBUTES,
  PROOF_REQUEST_SEND_PROOF_HANDLE,
} from '../proof/type-proof'
import {
  HYDRATE_PROOF_REQUESTS,
  MISSING_ATTRIBUTES_FOUND,
  PROOF_REQUEST_AUTO_FILL,
  PROOF_REQUEST_RECEIVED,
  PROOF_SERIALIZED,
} from '../proof-request/type-proof-request'
import {
  QUESTION_RECEIVED,
  HYDRATE_QUESTION_STORE,
  UPDATE_QUESTION_ANSWER,
  SEND_ANSWER_TO_QUESTION,
} from '../question/type-question'
import {
  CONNECT_REGISTER_CREATE_AGENT_DONE,
  HYDRATE_USER_STORE,
} from './user/type-user-store'
import {
  GET_WALLET_ENCRYPTION_KEY,
  WALLET_BALANCE_REFRESHED,
  SELECT_TOKEN_AMOUNT,
  TOKEN_SENT_SUCCESS,
  WALLET_HISTORY_REFRESHED,
  HYDRATE_WALLET_BALANCE,
  HYDRATE_WALLET_ADDRESSES,
  HYDRATE_WALLET_HISTORY,
  SEND_TOKENS_FAIL,
  WALLET_ADDRESSES_REFRESHED,
  SEND_TOKENS,
} from '../wallet/type-wallet'

export const CUSTOM_LOG_UTILS = {
  encryptionKey: '',
}

export const customLogger = {
  recordBuffer: [],
  vcxLogFile: undefined,
  encryptedLogFile: null,
  initOnlyOnce: false,
  logLevel: 'debug',
  alsoLogToConsole: process.env.NODE_ENV !== 'test' && __DEV__,
  MAX_ALLOWED_FILE_BYTES: 10000000,
  log: function(...allArgs: any[]) {
    //console.log(JSON.stringify(allArgs))
    this.addRecord({ levelName: 'log', args: allArgs })
    if (this.alsoLogToConsole) {
      console.log.apply(null, allArgs)
    }
  },
  error: function(...allArgs: any[]) {
    this.addRecord({ levelName: 'error', args: allArgs })
    if (this.alsoLogToConsole) {
      console.error.apply(null, allArgs)
    }
  },
  assert: function(...allArgs: any[]) {
    if (this.alsoLogToConsole) {
      console.assert.apply(null, allArgs)
    }
  },
  clear: function(...allArgs: any[]) {
    if (this.alsoLogToConsole) {
      console.clear.apply(null, allArgs)
    }
  },
  count: function(...allArgs: any[]) {
    if (this.alsoLogToConsole) {
      console.count.apply(null, allArgs)
    }
  },
  debug: function(...allArgs: any[]) {
    this.addRecord({ levelName: 'debug', args: allArgs })
    if (this.alsoLogToConsole) {
      console.debug.apply(null, allArgs)
    }
  },
  dir: function(...allArgs: any[]) {
    if (this.alsoLogToConsole) {
      console.dir.apply(null, allArgs)
    }
  },
  dirxml: function(...allArgs: any[]) {
    if (this.alsoLogToConsole) {
      console.dirxml.apply(null, allArgs)
    }
  },
  group: function(...allArgs: any[]) {
    if (this.alsoLogToConsole) {
      console.group.apply(null, allArgs)
    }
  },
  groupCollapsed: function(...allArgs: any[]) {
    if (this.alsoLogToConsole) {
      console.groupCollapsed.apply(null, allArgs)
    }
  },
  groupEnd: function(...allArgs: any[]) {
    if (this.alsoLogToConsole) {
      console.groupEnd.apply(null, allArgs)
    }
  },
  info: function(...allArgs: any[]) {
    if (this.alsoLogToConsole) {
      console.info.apply(null, allArgs)
    }
  },
  table: function(...allArgs: any[]) {
    if (this.alsoLogToConsole) {
      console.table.apply(null, allArgs)
    }
  },
  time: function(...allArgs: any[]) {
    if (this.alsoLogToConsole) {
      console.time.apply(null, allArgs)
    }
  },
  timeEnd: function(...allArgs: any[]) {
    if (this.alsoLogToConsole) {
      console.timeEnd.apply(null, allArgs)
    }
  },
  trace: function(...allArgs: any[]) {
    this.addRecord({ levelName: 'trace', args: allArgs })
    if (this.alsoLogToConsole) {
      console.trace.apply(null, allArgs)
    }
  },
  warn: function(...allArgs: any[]) {
    this.addRecord({ levelName: 'warn', args: allArgs })
    if (this.alsoLogToConsole) {
      console.warn.apply(null, allArgs)
    }
  },

  captureException: function(error: Error) {
    this.log(error.toString())
  },

  setVcxLogFile: function(logFile: string) {
    this.vcxLogFile = logFile
  },

  getVcxLogFile: function() {
    return this.vcxLogFile
  },

  getEncryptedVcxLogFile: function() {
    return this.encryptedLogFile
  },

  init: function(levelName: string) {
    if (!this.initOnlyOnce) {
      this.initOnlyOnce = true
      this.logLevel = levelName

      const fetchPromise = fetch(
        'https://connect.me/sendlogs.public.encryption.key.txt'
      )
      if (fetchPromise) {
        fetchPromise
          .then(function(response) {
            return response.text()
          })
          .then(function(verKey) {
            //console.log('The encryption key is: ', verKey)
            CUSTOM_LOG_UTILS.encryptionKey = verKey
          })
      }

      // invoke the RNIndy.setVcxLogger function
      uniqueId()
        .then(uniqueIdent => {
          //console.log('The app unique id is: ', uniqueIdent)
          setVcxLogger(this.logLevel, uniqueIdent, this.MAX_ALLOWED_FILE_BYTES)
            .then(logFilePath => {
              this.setVcxLogFile(logFilePath)
              //console.log('Setting vcx log file to: ', logFilePath)
            })
            .catch(error => {
              console.error('Error setting vcx log file: ', error)
            })
        })
        .catch(error => {
          console.error('Error getting unique id in redux store: ', error)
        })
    }
  },

  addRecord: function(record: any) {
    // write the logging record to the debug file
    const rotatingLog = this.getVcxLogFile()
    if (rotatingLog) {
      RNFetchBlob.fs
        .exists(rotatingLog)
        .then(exists => {
          if (exists) {
            if (this.recordBuffer.length) {
              for (let i = 0; i < this.recordBuffer.length; ++i) {
                this.writeToLog(rotatingLog, this.recordBuffer[i])
              }
              this.recordBuffer.length = 0
            }
            this.writeToLog(rotatingLog, record)
          } else {
            this.addRecordToBuffer(record)
          }
        })
        .catch(() => {
          console.log('Error when checking if file exists: ', rotatingLog)
        })
    } else {
      this.addRecordToBuffer(record)
    }
  },

  addRecordToBuffer: function(record: any) {
    if (this.recordBuffer.length <= 0 && !this.initOnlyOnce) {
      // This logic MUST ensure that this.init() is only invoked ONCE
      this.init('debug')
    }
    this.recordBuffer.push(record)
  },

  writeToLog: function(rotatingLog: string, record: any) {
    const recordAsString = JSON.stringify(record)

    if (recordAsString.indexOf('%c prev state') === -1) {
      writeToVcxLog(
        'ConnectMe.ReactNative',
        record.levelName,
        recordAsString,
        rotatingLog
      )
        .then(() => {
          //console.log('Wrote log message ' + recordAsString + ' to log file: ', rotatingLog)
        })
        .catch(error => {
          console.error(
            'Error writing log message ' + recordAsString + ' to log file: ',
            rotatingLog
          )
        })
    }
  },

  encryptLogFile: async function() {
    const rotatingLog = this.getVcxLogFile()
    this.encryptedLogFile = await encryptVcxLog(
      rotatingLog,
      CUSTOM_LOG_UTILS.encryptionKey
    )
    //console.log('Setting encrypted vcx log file to: ', this.encryptedLogFile)
    return this.encryptedLogFile
  },

  clearRecords: function() {},

  getRecords: function() {},
}

const hidePii = !__DEV__ || process.env.NODE_ENV === 'test'
const hiddenInfoReplacement = '****'

export function PiiHiddenTransformer(state: Store) {
  if (!hidePii) {
    // if we don't want to hide Pii from logging
    // then we return state object as it is
    return state
  }

  return _merge({}, state, {
    backup: {
      ...state.backup,
      passphrase: hiddenInfoReplacement,
    },
    connections: {
      ...state.connections,
      data: hiddenInfoReplacement,
    },
    claim: hiddenInfoReplacement,
    claimOffer: hiddenInfoReplacement,
    deepLink: {
      ...state.deepLink,
      tokens: hiddenInfoReplacement,
    },
    history: {
      ...state.history,
      data: hiddenInfoReplacement,
    },
    onfido: {
      ...state.onfido,
      applicantId:
        state.onfido.applicantId == null ? null : hiddenInfoReplacement,
      onfidoDid: state.onfido.onfidoDid == null ? null : hiddenInfoReplacement,
    },
    proof: hiddenInfoReplacement,
    proofRequest: hiddenInfoReplacement,
    question: {
      ...state.question,
      data: hiddenInfoReplacement,
    },
    user: {
      ...state.user,
      userOneTimeInfo: hiddenInfoReplacement,
    },
    wallet: {
      ...state.wallet,
      walletAddresses: {
        ...state.wallet.walletAddresses,
        data: hiddenInfoReplacement,
      },
      walletBalance: {
        ...state.wallet.walletBalance,
        data: hiddenInfoReplacement,
      },
      walletHistory: {
        ...state.wallet.walletHistory,
        transactions: hiddenInfoReplacement,
      },
      payment: {
        ...state.wallet.payment,
        tokenAmount: hiddenInfoReplacement,
      },
    },
  })
}

// Putting any for action because we don't yet have universal type
// for all action across our app. This is something we should do
// So, till we merge all actions into store action, we are using `any` here
export function PiiHiddenActionTransformer(action: any) {
  if (!hidePii) {
    return action
  }

  // we list name of properties that we want to hide from action logging
  const actionToFilterPropMap = {
    [GENERATE_RECOVERY_PHRASE_SUCCESS]: ['passphrase'],

    [NEW_CONNECTION]: ['connection'],
    [NEW_CONNECTION_SUCCESS]: ['connection'],
    [DELETE_CONNECTION]: ['senderDID'],
    [DELETE_CONNECTION_SUCCESS]: ['filteredConnections'],
    [DELETE_CONNECTION_FAILURE]: ['connection'],
    [HYDRATE_CONNECTIONS]: ['connections'],

    [CLAIM_RECEIVED]: ['claim'],
    [MAP_CLAIM_TO_SENDER]: ['senderDID', 'myPairwiseDID'],
    [CLAIM_RECEIVED_VCX]: ['claim'],
    [CLAIM_OFFER_RECEIVED]: ['payload', 'payloadInfo'],
    [SEND_CLAIM_REQUEST]: ['payload'],
    [SEND_CLAIM_REQUEST_SUCCESS]: ['payload'],
    [SEND_PAID_CREDENTIAL_REQUEST]: ['payload'],
    [ADD_SERIALIZED_CLAIM_OFFER]: [
      'serializedClaimOffer',
      'userDID',
      'claimOfferVcxState',
    ],
    [HYDRATE_CLAIM_OFFERS_SUCCESS]: ['claimOffers'],

    [DEEP_LINK_DATA]: ['data'],
    [DEEP_LINK_PROCESSED]: ['data'],

    [LOAD_HISTORY_SUCCESS]: ['data'],
    [RECORD_HISTORY_EVENT]: ['historyEvent'],
    [DELETE_HISTORY_EVENT]: ['historyEvent'],
    [HISTORY_EVENT_OCCURRED]: ['event'],

    [ONFIDO_CONNECTION_ESTABLISHED]: ['onfidoDid'],
    [HYDRATE_ONFIDO_APPLICANT_ID_SUCCESS]: ['applicantId'],
    [UPDATE_ONFIDO_APPLICANT_ID]: ['applicantId'],
    [HYDRATE_ONFIDO_DID_SUCCESS]: ['onfidoDid'],

    [UPDATE_ATTRIBUTE_CLAIM]: ['requestedAttrsJson'],
    [PROOF_SUCCESS]: ['proof'],
    [USER_SELF_ATTESTED_ATTRIBUTES]: ['selfAttestedAttributes'],
    [PROOF_REQUEST_SEND_PROOF_HANDLE]: ['selfAttestedAttributes'],
    [HYDRATE_PROOF_REQUESTS]: ['proofRequests'],
    [PROOF_REQUEST_AUTO_FILL]: ['requestedAttributes'],
    [PROOF_REQUEST_RECEIVED]: ['payload', 'payloadInfo'],
    [PROOF_SERIALIZED]: ['serializedProof'],

    [QUESTION_RECEIVED]: ['question'],
    [HYDRATE_QUESTION_STORE]: ['data'],
    [UPDATE_QUESTION_ANSWER]: ['answer'],
    [SEND_ANSWER_TO_QUESTION]: ['answer'],

    [CONNECT_REGISTER_CREATE_AGENT_DONE]: ['userOneTimeInfo'],
    [HYDRATE_USER_STORE]: ['data'],

    [GET_WALLET_ENCRYPTION_KEY]: ['data'],

    [SEND_TOKENS]: ['tokenAmount', 'recipientWalletAddress'],
  }

  // There are some action which has deep nested data
  // for example: wallet store has action that has data nested
  //  type: WALLET_BALANCE_REFRESHED,
  //  walletBalance: {
  //    data: walletBalanceData,
  //    status: STORE_STATUS.SUCCESS,
  //    error: null,
  //  },
  // For above type of action, simple prop naming walletBalance
  // would stop showing error and status as well
  // which does not include PII and also we want to know those values
  // when we want to debug from logs.
  // So, for these type of logs we are running below if conditions
  // so that we can gain more finer access to actions than
  // we are getting from above propFilterMap
  if (
    [WALLET_BALANCE_REFRESHED, HYDRATE_WALLET_BALANCE].includes(action.type)
  ) {
    return {
      ...action,
      walletBalance: {
        ...action.walletBalance,
        data: hiddenInfoReplacement,
      },
    }
  }

  if (
    [TOKEN_SENT_SUCCESS, SELECT_TOKEN_AMOUNT, SEND_TOKENS_FAIL].includes(
      action.type
    )
  ) {
    return {
      ...action,
      payment: {
        ...action.payment,
        tokenAmount: hiddenInfoReplacement,
      },
    }
  }

  if (
    [WALLET_ADDRESSES_REFRESHED, HYDRATE_WALLET_ADDRESSES].includes(action.type)
  ) {
    return {
      ...action,
      walletAddresses: {
        ...action.walletAddresses,
        data: hiddenInfoReplacement,
      },
    }
  }

  if (
    [WALLET_HISTORY_REFRESHED, HYDRATE_WALLET_HISTORY].includes(action.type)
  ) {
    return {
      ...action,
      walletHistory: {
        ...action.walletHistory,
        transactions: hiddenInfoReplacement,
      },
    }
  }

  return {
    ...action,
    ..._flatten(Object.values(actionToFilterPropMap)).reduce(
      (acc, value: string) => {
        if (value in action) {
          return {
            ...acc,
            [value]: hiddenInfoReplacement,
          }
        }

        return acc
      },
      {}
    ),
  }
}
