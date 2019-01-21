// @flow
import { Alert } from 'react-native'
import {
  put,
  take,
  all,
  call,
  fork,
  select,
  takeLatest,
} from 'redux-saga/effects'

import { secureSet, getHydrationItem } from '../services/storage'
import {
  getErrorAlertsSwitchValue,
  getPushToken,
  getHydrationState,
  getConfig,
  getUserOneTimeInfo,
  getVcxInitializationState,
  getCurrentScreen,
  getAllConnectionsPairwiseDid,
  getConnection,
  getSerializedClaimOffer,
  getPendingHistory,
  getClaimOffer,
  getClaimOffers,
} from '../store/store-selector'
import {
  SERVER_ENVIRONMENT,
  HYDRATED,
  INITIALIZED,
  APP_INSTALLED,
  ALREADY_INSTALLED_RESULT,
  SERVER_ENVIRONMENT_CHANGED,
  SWITCH_ERROR_ALERTS,
  TOGGLE_ERROR_ALERTS,
  SWITCH_ENVIRONMENT,
  STORAGE_KEY_SWITCHED_ENVIRONMENT_DETAIL,
  SAVE_SWITCH_ENVIRONMENT_DETAIL_FAIL,
  ERROR_SAVE_SWITCH_ENVIRONMENT,
  ERROR_HYDRATE_SWITCH_ENVIRONMENT,
  HYDRATE_SWITCH_ENVIRONMENT_DETAIL_FAIL,
  CHANGE_ENVIRONMENT_VIA_URL,
  schemaDownloadedEnvironmentDetails,
  MESSAGE_FAIL_ENVIRONMENT_SWITCH_TITLE,
  MESSAGE_FAIL_ENVIRONMENT_SWITCH_INVALID_DATA,
  MESSAGE_FAIL_ENVIRONMENT_SWITCH_ERROR,
  MESSAGE_SUCCESS_ENVIRONMENT_SWITCH_DESCRIPTION,
  MESSAGE_SUCCESS_ENVIRONMENT_SWITCH_TITLE,
  VCX_INIT_START,
  VCX_INIT_SUCCESS,
  VCX_INIT_FAIL,
  ERROR_VCX_INIT_FAIL,
  ERROR_VCX_PROVISION_FAIL,
  VCX_INIT_NOT_STARTED,
  UNSAFE_SCREENS_TO_DOWNLOAD_SMS,
  MESSAGE_RESPONSE_CODE,
  ACKNOWLEDGE_MESSAGES_FAIL,
  GET_MESSAGES_FAIL,
  ACKNOWLEDGE_MESSAGES,
  GET_MESSAGES_SUCCESS,
  GET_MESSAGES_LOADING,
  GET_UN_ACKNOWLEDGED_MESSAGES,
} from './type-config-store'
import type {
  ServerEnvironment,
  ConfigStore,
  ConfigAction,
  ServerEnvironmentChangedAction,
  SwitchEnvironmentAction,
  ChangeEnvironment,
  ChangeEnvironmentUrlAction,
  DownloadedMessage,
  DownloadedConnectionsWithMessages,
  AcknowledgeServerData,
  DownloadedConnectionMessages,
  ParsedDecryptedPayloadMessage,
  ParsedDecryptedPayload,
  MessageClaimOfferDetails,
  MessagePaymentDetails,
  SerializedClaimOfferData,
  GetUnacknowledgedMessagesAction,
  GetMessagesLoadingAction,
  GetMessagesSuccessAction,
  AcknowledgeMessagesAction,
  GetMessagesFailAction,
  AcknowledgeMessagesFailAction,
} from './type-config-store'
import type { CustomError } from '../common/type-common'
import { downloadEnvironmentDetails } from '../api/api'
import schemaValidator from '../services/schema-validator'
import type { EnvironmentDetailUrlDownloaded } from '../api/type-api'
import {
  init,
  createOneTimeInfo,
  simpleInit,
  vcxShutdown,
  downloadMessages,
  updateMessages,
  downloadProofRequest,
  getHandleBySerializedConnection,
  getClaimHandleBySerializedClaimOffer,
  proofDeserialize,
} from '../bridge/react-native-cxs/RNCxs'
import { RESET } from '../common/type-common'
import type { Connection } from './type-connection-store'
import {
  updatePushToken,
  updatePayloadToRelevantStore,
  fetchAdditionalDataError,
  updatePayloadToRelevantStoreSaga,
} from '../push-notification/push-notification-store'
import type { VcxProvisionResult } from '../bridge/react-native-cxs/type-cxs'
import type { UserOneTimeInfo } from './user/type-user-store'
import { connectRegisterCreateAgentDone } from './user/user-store'
import findKey from 'lodash.findkey'
import { SAFE_TO_DOWNLOAD_SMS_INVITATION } from '../sms-pending-invitation/type-sms-pending-invitation'
import { GENESIS_FILE_NAME } from '../api/api-constants'
import type {
  ClaimOfferMessagePayload,
  ClaimPushPayload,
} from './../push-notification/type-push-notification'
import type {
  ProofRequestPushPayload,
  StringifiableProofRequest,
  ProofRequest,
  ProofRequestData,
} from '../proof-request/type-proof-request'
import type { ClaimPushPayloadVcx } from './../claim/type-claim'
import { MESSAGE_TYPE } from '../api/api-constants'
import {
  saveSerializedClaimOffer,
  claimOfferAccepted,
  acceptClaimOffer,
  addSerializedClaimOffer,
} from './../claim-offer/claim-offer-store'
import {
  CLAIM_REQUEST_STATUS,
  VCX_CLAIM_OFFER_STATE,
} from './../claim-offer/type-claim-offer'
import { claimReceivedVcx, claimReceivedVcxSaga } from './../claim/claim-store'
import type { SerializedClaimOffer } from '../claim-offer/type-claim-offer'
import { SEND_CLAIM_REQUEST } from '../claim-offer/type-claim-offer'
import { getPendingFetchAdditionalDataKey } from './store-selector'
import firebase from 'react-native-firebase'
import { captureError } from '../services/error/error-handler'
import { customLogger } from '../store/custom-logger'
import { race } from 'redux-saga/effects'

/**
 * this file contains configuration which is changed only from user action
 * this store should not contain any configuration
 * which are not result of user action
 */

export const baseUrls = {
  [SERVER_ENVIRONMENT.DEVELOPMENT]: {
    agencyUrl: 'http://52.35.57.49',
    agencyDID: 'dTLdJqRZLwMuWSogcKfBT',
    agencyVerificationKey: 'LsPQTDHi294TexkFmZK9Q9vW4YGtQRuLV8wuyZi94yH',
    poolConfig:
      '{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node1","blskey":"4N8aUNHSgjQVgkpm8nhNEfDf6txHznoYREg9kirmJrkivgL4oSEimFF6nsQ6M41QvhM2Z33nves5vfSn9n1UwNFJBYtWVnHYMATn76vLuL3zU88KyeAYcHfsih3He6UHcXDxcaecHVz6jhCYz1P2UZn2bDVruL5wXpehgBfBaLKm3Ba","client_ip":"35.164.240.131","client_port":9702,"node_ip":"35.164.240.131","node_port":9701,"services":["VALIDATOR"]},"dest":"Gw6pDLhcBcoQesN72qfotTgFa7cbuqZpkX3Xo6pLhPhv"},"metadata":{"from":"Th7MpTaRZVRYnPiabds81Y"},"type":"0"},"txnMetadata":{"seqNo":1,"txnId":"fea82e10e894419fe2bea7d96296a6d46f50f93f9eeda954ec461b2ed2950b62"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node2","blskey":"37rAPpXVoxzKhz7d9gkUe52XuXryuLXoM6P6LbWDB7LSbG62Lsb33sfG7zqS8TK1MXwuCHj1FKNzVpsnafmqLG1vXN88rt38mNFs9TENzm4QHdBzsvCuoBnPH7rpYYDo9DZNJePaDvRvqJKByCabubJz3XXKbEeshzpz4Ma5QYpJqjk","client_ip":"35.164.240.131","client_port":9704,"node_ip":"35.164.240.131","node_port":9703,"services":["VALIDATOR"]},"dest":"8ECVSk179mjsjKRLWiQtssMLgp6EPhWXtaYyStWPSGAb"},"metadata":{"from":"EbP4aYNeTHL6q385GuVpRV"},"type":"0"},"txnMetadata":{"seqNo":2,"txnId":"1ac8aece2a18ced660fef8694b61aac3af08ba875ce3026a160acbc3a3af35fc"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node3","blskey":"3WFpdbg7C5cnLYZwFZevJqhubkFALBfCBBok15GdrKMUhUjGsk3jV6QKj6MZgEubF7oqCafxNdkm7eswgA4sdKTRc82tLGzZBd6vNqU8dupzup6uYUf32KTHTPQbuUM8Yk4QFXjEf2Usu2TJcNkdgpyeUSX42u5LqdDDpNSWUK5deC5","client_ip":"35.164.240.131","client_port":9706,"node_ip":"35.164.240.131","node_port":9705,"services":["VALIDATOR"]},"dest":"DKVxG2fXXTU8yT5N7hGEbXB3dfdAnYv1JczDUHpmDxya"},"metadata":{"from":"4cU41vWW82ArfxJxHkzXPG"},"type":"0"},"txnMetadata":{"seqNo":3,"txnId":"7e9f355dffa78ed24668f0e0e369fd8c224076571c51e2ea8be5f26479edebe4"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node4","blskey":"2zN3bHM1m4rLz54MJHYSwvqzPchYp8jkHswveCLAEJVcX6Mm1wHQD1SkPYMzUDTZvWvhuE6VNAkK3KxVeEmsanSmvjVkReDeBEMxeDaayjcZjFGPydyey1qxBHmTvAnBKoPydvuTAqx5f7YNNRAdeLmUi99gERUU7TD8KfAa6MpQ9bw","client_ip":"35.164.240.131","client_port":9708,"node_ip":"35.164.240.131","node_port":9707,"services":["VALIDATOR"]},"dest":"4PS3EDQ3dW1tci1Bp6543CfuuebjFrg36kLAUcskGfaA"},"metadata":{"from":"TWwCRQRZ2ZHMJFn9TzLp7W"},"type":"0"},"txnMetadata":{"seqNo":4,"txnId":"aa5e817d7cc626170eca175822029339a444eb0ee8f0bd20d3b0b76e566fb008"},"ver":"1"}',
  },
  [SERVER_ENVIRONMENT.SANDBOX]: {
    agencyUrl: 'http://52.25.123.226',
    agencyDID: 'Nv9oqGX57gy15kPSJzo2i4',
    agencyVerificationKey: 'CwpcjCc6MtVNdQgwoonNMFoR6dhzmRXHHaUCRSrjh8gj',
    poolConfig:
      '{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node1","blskey":"4N8aUNHSgjQVgkpm8nhNEfDf6txHznoYREg9kirmJrkivgL4oSEimFF6nsQ6M41QvhM2Z33nves5vfSn9n1UwNFJBYtWVnHYMATn76vLuL3zU88KyeAYcHfsih3He6UHcXDxcaecHVz6jhCYz1P2UZn2bDVruL5wXpehgBfBaLKm3Ba","client_ip":"34.212.206.9","client_port":9702,"node_ip":"34.212.206.9","node_port":9701,"services":["VALIDATOR"]},"dest":"Gw6pDLhcBcoQesN72qfotTgFa7cbuqZpkX3Xo6pLhPhv"},"metadata":{"from":"Th7MpTaRZVRYnPiabds81Y"},"type":"0"},"txnMetadata":{"seqNo":1,"txnId":"fea82e10e894419fe2bea7d96296a6d46f50f93f9eeda954ec461b2ed2950b62"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node2","blskey":"37rAPpXVoxzKhz7d9gkUe52XuXryuLXoM6P6LbWDB7LSbG62Lsb33sfG7zqS8TK1MXwuCHj1FKNzVpsnafmqLG1vXN88rt38mNFs9TENzm4QHdBzsvCuoBnPH7rpYYDo9DZNJePaDvRvqJKByCabubJz3XXKbEeshzpz4Ma5QYpJqjk","client_ip":"34.212.206.9","client_port":9704,"node_ip":"34.212.206.9","node_port":9703,"services":["VALIDATOR"]},"dest":"8ECVSk179mjsjKRLWiQtssMLgp6EPhWXtaYyStWPSGAb"},"metadata":{"from":"EbP4aYNeTHL6q385GuVpRV"},"type":"0"},"txnMetadata":{"seqNo":2,"txnId":"1ac8aece2a18ced660fef8694b61aac3af08ba875ce3026a160acbc3a3af35fc"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node3","blskey":"3WFpdbg7C5cnLYZwFZevJqhubkFALBfCBBok15GdrKMUhUjGsk3jV6QKj6MZgEubF7oqCafxNdkm7eswgA4sdKTRc82tLGzZBd6vNqU8dupzup6uYUf32KTHTPQbuUM8Yk4QFXjEf2Usu2TJcNkdgpyeUSX42u5LqdDDpNSWUK5deC5","client_ip":"34.212.206.9","client_port":9706,"node_ip":"34.212.206.9","node_port":9705,"services":["VALIDATOR"]},"dest":"DKVxG2fXXTU8yT5N7hGEbXB3dfdAnYv1JczDUHpmDxya"},"metadata":{"from":"4cU41vWW82ArfxJxHkzXPG"},"type":"0"},"txnMetadata":{"seqNo":3,"txnId":"7e9f355dffa78ed24668f0e0e369fd8c224076571c51e2ea8be5f26479edebe4"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node4","blskey":"2zN3bHM1m4rLz54MJHYSwvqzPchYp8jkHswveCLAEJVcX6Mm1wHQD1SkPYMzUDTZvWvhuE6VNAkK3KxVeEmsanSmvjVkReDeBEMxeDaayjcZjFGPydyey1qxBHmTvAnBKoPydvuTAqx5f7YNNRAdeLmUi99gERUU7TD8KfAa6MpQ9bw","client_ip":"34.212.206.9","client_port":9708,"node_ip":"34.212.206.9","node_port":9707,"services":["VALIDATOR"]},"dest":"4PS3EDQ3dW1tci1Bp6543CfuuebjFrg36kLAUcskGfaA"},"metadata":{"from":"TWwCRQRZ2ZHMJFn9TzLp7W"},"type":"0"},"txnMetadata":{"seqNo":4,"txnId":"aa5e817d7cc626170eca175822029339a444eb0ee8f0bd20d3b0b76e566fb008"},"ver":"1"}',
  },
  [SERVER_ENVIRONMENT.STAGING]: {
    agencyUrl: 'https://agency.pstg.evernym.com',
    agencyDID: 'LqnB96M6wBALqRZsrTTwda',
    agencyVerificationKey: 'BpDPZHLbJFu67sWujecoreojiWZbi2dgf4xnYemUzFvB',
    poolConfig:
      '{"reqSignature":{},"txn":{"data":{"data":{"alias":"australia","client_ip":"52.64.96.160","client_port":"9702","node_ip":"52.64.96.160","node_port":"9701","services":["VALIDATOR"]},"dest":"UZH61eLH3JokEwjMWQoCMwB3PMD6zRBvG6NCv5yVwXz"},"metadata":{"from":"3U8HUen8WcgpbnEz1etnai"},"type":"0"},"txnMetadata":{"seqNo":1,"txnId":"c585f1decb986f7ff19b8d03deba346ab8a0494cc1e4d69ad9b8acb0dfbeab6f"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"brazil","client_ip":"54.233.203.241","client_port":"9702","node_ip":"54.233.203.241","node_port":"9701","services":["VALIDATOR"]},"dest":"2MHGDD2XpRJohQzsXu4FAANcmdypfNdpcqRbqnhkQsCq"},"metadata":{"from":"G3knUCmDrWd1FJrRryuKTw"},"type":"0"},"txnMetadata":{"seqNo":2,"txnId":"5c8f52ca28966103ff0aad98160bc8e978c9ca0285a2043a521481d11ed17506"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"canada","client_ip":"52.60.207.225","client_port":"9702","node_ip":"52.60.207.225","node_port":"9701","services":["VALIDATOR"]},"dest":"8NZ6tbcPN2NVvf2fVhZWqU11XModNudhbe15JSctCXab"},"metadata":{"from":"22QmMyTEAbaF4VfL7LameE"},"type":"0"},"txnMetadata":{"seqNo":3,"txnId":"408c7c5887a0f3905767754f424989b0089c14ac502d7f851d11b31ea2d1baa6"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"england","client_ip":"52.56.191.9","client_port":"9702","node_ip":"52.56.191.9","node_port":"9701","services":["VALIDATOR"]},"dest":"DNuLANU7f1QvW1esN3Sv9Eap9j14QuLiPeYzf28Nub4W"},"metadata":{"from":"NYh3bcUeSsJJcxBE6TTmEr"},"type":"0"},"txnMetadata":{"seqNo":4,"txnId":"d56d0ff69b62792a00a361fbf6e02e2a634a7a8da1c3e49d59e71e0f19c27875"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"korea","client_ip":"52.79.115.223","client_port":"9702","node_ip":"52.79.115.223","node_port":"9701","services":["VALIDATOR"]},"dest":"HCNuqUoXuK9GXGd2EULPaiMso2pJnxR6fCZpmRYbc7vM"},"metadata":{"from":"U38UHML5A1BQ1mYh7tYXeu"},"type":"0"},"txnMetadata":{"seqNo":5,"txnId":"76201e78aca720dbaf516d86d9342ad5b5d46f5badecf828eb9edfee8ab48a50"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"singapore","client_ip":"13.228.62.7","client_port":"9702","node_ip":"13.228.62.7","node_port":"9701","services":["VALIDATOR"]},"dest":"Dh99uW8jSNRBiRQ4JEMpGmJYvzmF35E6ibnmAAf7tbk8"},"metadata":{"from":"HfXThVwhJB4o1Q1Fjr4yrC"},"type":"0"},"txnMetadata":{"seqNo":6,"txnId":"51e2a46721d104d9148d85b617833e7745fdbd6795cb0b502a5b6ea31d33378e"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"virginia","client_ip":"34.225.215.131","client_port":"9702","node_ip":"34.225.215.131","node_port":"9701","services":["VALIDATOR"]},"dest":"EoGRm7eRADtHJRThMCrBXMUM2FpPRML19tNxDAG8YTP8"},"metadata":{"from":"SPdfHq6rGcySFVjDX4iyCo"},"type":"0"},"txnMetadata":{"seqNo":7,"txnId":"0a4992ea442b53e3dca861deac09a8d4987004a8483079b12861080ea4aa1b52"},"ver":"1"}',
  },
  [SERVER_ENVIRONMENT.DEMO]: {
    agencyUrl: 'https://agency.pps.evernym.com',
    agencyDID: '3mbwr7i85JNSL3LoNQecaW',
    agencyVerificationKey: '2WXxo6y1FJvXWgZnoYUP5BJej2mceFrqBDNPE3p6HDPf',
    poolConfig:
      '{"reqSignature":{},"txn":{"data":{"data":{"alias":"australia","client_ip":"52.64.96.160","client_port":"9702","node_ip":"52.64.96.160","node_port":"9701","services":["VALIDATOR"]},"dest":"UZH61eLH3JokEwjMWQoCMwB3PMD6zRBvG6NCv5yVwXz"},"metadata":{"from":"3U8HUen8WcgpbnEz1etnai"},"type":"0"},"txnMetadata":{"seqNo":1,"txnId":"c585f1decb986f7ff19b8d03deba346ab8a0494cc1e4d69ad9b8acb0dfbeab6f"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"brazil","client_ip":"54.233.203.241","client_port":"9702","node_ip":"54.233.203.241","node_port":"9701","services":["VALIDATOR"]},"dest":"2MHGDD2XpRJohQzsXu4FAANcmdypfNdpcqRbqnhkQsCq"},"metadata":{"from":"G3knUCmDrWd1FJrRryuKTw"},"type":"0"},"txnMetadata":{"seqNo":2,"txnId":"5c8f52ca28966103ff0aad98160bc8e978c9ca0285a2043a521481d11ed17506"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"canada","client_ip":"52.60.207.225","client_port":"9702","node_ip":"52.60.207.225","node_port":"9701","services":["VALIDATOR"]},"dest":"8NZ6tbcPN2NVvf2fVhZWqU11XModNudhbe15JSctCXab"},"metadata":{"from":"22QmMyTEAbaF4VfL7LameE"},"type":"0"},"txnMetadata":{"seqNo":3,"txnId":"408c7c5887a0f3905767754f424989b0089c14ac502d7f851d11b31ea2d1baa6"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"england","client_ip":"52.56.191.9","client_port":"9702","node_ip":"52.56.191.9","node_port":"9701","services":["VALIDATOR"]},"dest":"DNuLANU7f1QvW1esN3Sv9Eap9j14QuLiPeYzf28Nub4W"},"metadata":{"from":"NYh3bcUeSsJJcxBE6TTmEr"},"type":"0"},"txnMetadata":{"seqNo":4,"txnId":"d56d0ff69b62792a00a361fbf6e02e2a634a7a8da1c3e49d59e71e0f19c27875"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"korea","client_ip":"52.79.115.223","client_port":"9702","node_ip":"52.79.115.223","node_port":"9701","services":["VALIDATOR"]},"dest":"HCNuqUoXuK9GXGd2EULPaiMso2pJnxR6fCZpmRYbc7vM"},"metadata":{"from":"U38UHML5A1BQ1mYh7tYXeu"},"type":"0"},"txnMetadata":{"seqNo":5,"txnId":"76201e78aca720dbaf516d86d9342ad5b5d46f5badecf828eb9edfee8ab48a50"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"singapore","client_ip":"13.228.62.7","client_port":"9702","node_ip":"13.228.62.7","node_port":"9701","services":["VALIDATOR"]},"dest":"Dh99uW8jSNRBiRQ4JEMpGmJYvzmF35E6ibnmAAf7tbk8"},"metadata":{"from":"HfXThVwhJB4o1Q1Fjr4yrC"},"type":"0"},"txnMetadata":{"seqNo":6,"txnId":"51e2a46721d104d9148d85b617833e7745fdbd6795cb0b502a5b6ea31d33378e"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"virginia","client_ip":"34.225.215.131","client_port":"9702","node_ip":"34.225.215.131","node_port":"9701","services":["VALIDATOR"]},"dest":"EoGRm7eRADtHJRThMCrBXMUM2FpPRML19tNxDAG8YTP8"},"metadata":{"from":"SPdfHq6rGcySFVjDX4iyCo"},"type":"0"},"txnMetadata":{"seqNo":7,"txnId":"0a4992ea442b53e3dca861deac09a8d4987004a8483079b12861080ea4aa1b52"},"ver":"1"}',
  },
  [SERVER_ENVIRONMENT.QATEST1]: {
    agencyUrl: 'http://casq002.pqa.evernym.com',
    agencyDID: 'L1gaixoxvbVg97HYnrr6rG',
    agencyVerificationKey: 'BMzy1cEuSFvnKYjjBxY4jC2gQbNmaVX3Kg5zJJiXAwq8',
    poolConfig:
      '{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node1","blskey":"4N8aUNHSgjQVgkpm8nhNEfDf6txHznoYREg9kirmJrkivgL4oSEimFF6nsQ6M41QvhM2Z33nves5vfSn9n1UwNFJBYtWVnHYMATn76vLuL3zU88KyeAYcHfsih3He6UHcXDxcaecHVz6jhCYz1P2UZn2bDVruL5wXpehgBfBaLKm3Ba","client_ip":"54.233.136.74","client_port":9702,"node_ip":"54.233.136.74","node_port":9701,"services":["VALIDATOR"]},"dest":"Gw6pDLhcBcoQesN72qfotTgFa7cbuqZpkX3Xo6pLhPhv"},"metadata":{"from":"Th7MpTaRZVRYnPiabds81Y"},"type":"0"},"txnMetadata":{"seqNo":1,"txnId":"fea82e10e894419fe2bea7d96296a6d46f50f93f9eeda954ec461b2ed2950b62"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node2","blskey":"37rAPpXVoxzKhz7d9gkUe52XuXryuLXoM6P6LbWDB7LSbG62Lsb33sfG7zqS8TK1MXwuCHj1FKNzVpsnafmqLG1vXN88rt38mNFs9TENzm4QHdBzsvCuoBnPH7rpYYDo9DZNJePaDvRvqJKByCabubJz3XXKbEeshzpz4Ma5QYpJqjk","client_ip":"13.228.112.216","client_port":9704,"node_ip":"13.228.112.216","node_port":9703,"services":["VALIDATOR"]},"dest":"8ECVSk179mjsjKRLWiQtssMLgp6EPhWXtaYyStWPSGAb"},"metadata":{"from":"EbP4aYNeTHL6q385GuVpRV"},"type":"0"},"txnMetadata":{"seqNo":2,"txnId":"1ac8aece2a18ced660fef8694b61aac3af08ba875ce3026a160acbc3a3af35fc"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node3","blskey":"3WFpdbg7C5cnLYZwFZevJqhubkFALBfCBBok15GdrKMUhUjGsk3jV6QKj6MZgEubF7oqCafxNdkm7eswgA4sdKTRc82tLGzZBd6vNqU8dupzup6uYUf32KTHTPQbuUM8Yk4QFXjEf2Usu2TJcNkdgpyeUSX42u5LqdDDpNSWUK5deC5","client_ip":"13.54.146.111","client_port":9706,"node_ip":"13.54.146.111","node_port":9705,"services":["VALIDATOR"]},"dest":"DKVxG2fXXTU8yT5N7hGEbXB3dfdAnYv1JczDUHpmDxya"},"metadata":{"from":"4cU41vWW82ArfxJxHkzXPG"},"type":"0"},"txnMetadata":{"seqNo":3,"txnId":"7e9f355dffa78ed24668f0e0e369fd8c224076571c51e2ea8be5f26479edebe4"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node4","blskey":"2zN3bHM1m4rLz54MJHYSwvqzPchYp8jkHswveCLAEJVcX6Mm1wHQD1SkPYMzUDTZvWvhuE6VNAkK3KxVeEmsanSmvjVkReDeBEMxeDaayjcZjFGPydyey1qxBHmTvAnBKoPydvuTAqx5f7YNNRAdeLmUi99gERUU7TD8KfAa6MpQ9bw","client_ip":"13.113.117.92","client_port":9708,"node_ip":"13.113.117.92","node_port":9707,"services":["VALIDATOR"]},"dest":"4PS3EDQ3dW1tci1Bp6543CfuuebjFrg36kLAUcskGfaA"},"metadata":{"from":"TWwCRQRZ2ZHMJFn9TzLp7W"},"type":"0"},"txnMetadata":{"seqNo":4,"txnId":"aa5e817d7cc626170eca175822029339a444eb0ee8f0bd20d3b0b76e566fb008"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node5","blskey":"2JSLkTGhnG3ZzGoeuZufc7V1kF5wxHqTuSUbaudhwRJzsGZupNHs5igohLnsdcYG7kFj1JGC5aV2JuiJtDtHPKBeGw24ZmBJ44YYaqfCMi5ywNyP42aSjMkvjtHrGS7oVoFbP4aG4aRaKZL3UZbbGcnGTK5kfacmBNKdPSQDyXGCoxB","client_ip":"52.209.67.38","client_port":9710,"node_ip":"52.209.67.38","node_port":9709,"services":["VALIDATOR"]},"dest":"4SWokCJWJc69Tn74VvLS6t2G2ucvXqM9FDMsWJjmsUxe"},"metadata":{"from":"92PMXtzRGuTAhAK5xPbwqq"},"type":"0"},"txnMetadata":{"seqNo":5,"txnId":"5abef8bc27d85d53753c5b6ed0cd2e197998c21513a379bfcf44d9c7a73c3a7e"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node6","blskey":"3D5JAwAhjW5gik1ogKrnQaVrHY94e8E56iA5UifXjjYypMm2LifLiaRtgWJPiFA6uv2EiGy4MYByZ88Rmi8K3mUvb9TZeR9sdLBxsTdqrikeenac8ZVNkdCaFmGWcw8xVGqgv9cs574YDj7nuLHbJUDXN17J2fzQiD83iVQVQHW1RuU","client_ip":"35.170.106.44","client_port":9712,"node_ip":"35.170.106.44","node_port":9711,"services":["VALIDATOR"]},"dest":"Cv1Ehj43DDM5ttNBmC6VPpEfwXWwfGktHwjDJsTV5Fz8"},"metadata":{"from":"HaN1iLFgVfM31ssY4obfYN"},"type":"0"},"txnMetadata":{"seqNo":6,"txnId":"a23059dc16aaf4513f97ca91f272235e809f8bda8c40f6688b88615a2c318ff8"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node7","blskey":"4ahBpE7gVEhW2evVgS69EJeSyciwbbby67iQj4htsgdtCxxXsEHMS6oKVeEQvrBBgncHfAddQyTt7ZF1PcfMX1Gu3xsgnzBDcLzPBz6ZdoXwi3uDPEoDZHXeDp1AFj8cidhfBWzY1FfKZMvh1HYQX8zZWMw579pYs3SyNoWLNdsNd8Q","client_ip":"52.60.212.231","client_port":9714,"node_ip":"52.60.212.231","node_port":9713,"services":["VALIDATOR"]},"dest":"BM8dTooz5uykCbYSAAFwKNkYfT4koomBHsSWHTDtkjhW"},"metadata":{"from":"BgJMUfWjWZBDAsu251dtrF"},"type":"0"},"txnMetadata":{"seqNo":7,"txnId":"e5f11aa7ec7091ca6c31a826eec885da7fcaa47611d03fdc3562b48247f179cf"},"ver":"1"}',
  },
  [SERVER_ENVIRONMENT.QATEST2]: {
    agencyUrl: 'http://casq003.pqa.evernym.com',
    agencyDID: 'ELwHwB7saeNjpHDJq9Z2i6',
    agencyVerificationKey: '8GpeQGjicpEFr46yQpQwxuQm85ViScnw4TieXW7zVSGM',
    poolConfig:
      '{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node1","blskey":"4N8aUNHSgjQVgkpm8nhNEfDf6txHznoYREg9kirmJrkivgL4oSEimFF6nsQ6M41QvhM2Z33nves5vfSn9n1UwNFJBYtWVnHYMATn76vLuL3zU88KyeAYcHfsih3He6UHcXDxcaecHVz6jhCYz1P2UZn2bDVruL5wXpehgBfBaLKm3Ba","client_ip":"54.233.136.74","client_port":9702,"node_ip":"54.233.136.74","node_port":9701,"services":["VALIDATOR"]},"dest":"Gw6pDLhcBcoQesN72qfotTgFa7cbuqZpkX3Xo6pLhPhv"},"metadata":{"from":"Th7MpTaRZVRYnPiabds81Y"},"type":"0"},"txnMetadata":{"seqNo":1,"txnId":"fea82e10e894419fe2bea7d96296a6d46f50f93f9eeda954ec461b2ed2950b62"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node2","blskey":"37rAPpXVoxzKhz7d9gkUe52XuXryuLXoM6P6LbWDB7LSbG62Lsb33sfG7zqS8TK1MXwuCHj1FKNzVpsnafmqLG1vXN88rt38mNFs9TENzm4QHdBzsvCuoBnPH7rpYYDo9DZNJePaDvRvqJKByCabubJz3XXKbEeshzpz4Ma5QYpJqjk","client_ip":"13.228.112.216","client_port":9704,"node_ip":"13.228.112.216","node_port":9703,"services":["VALIDATOR"]},"dest":"8ECVSk179mjsjKRLWiQtssMLgp6EPhWXtaYyStWPSGAb"},"metadata":{"from":"EbP4aYNeTHL6q385GuVpRV"},"type":"0"},"txnMetadata":{"seqNo":2,"txnId":"1ac8aece2a18ced660fef8694b61aac3af08ba875ce3026a160acbc3a3af35fc"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node3","blskey":"3WFpdbg7C5cnLYZwFZevJqhubkFALBfCBBok15GdrKMUhUjGsk3jV6QKj6MZgEubF7oqCafxNdkm7eswgA4sdKTRc82tLGzZBd6vNqU8dupzup6uYUf32KTHTPQbuUM8Yk4QFXjEf2Usu2TJcNkdgpyeUSX42u5LqdDDpNSWUK5deC5","client_ip":"13.54.146.111","client_port":9706,"node_ip":"13.54.146.111","node_port":9705,"services":["VALIDATOR"]},"dest":"DKVxG2fXXTU8yT5N7hGEbXB3dfdAnYv1JczDUHpmDxya"},"metadata":{"from":"4cU41vWW82ArfxJxHkzXPG"},"type":"0"},"txnMetadata":{"seqNo":3,"txnId":"7e9f355dffa78ed24668f0e0e369fd8c224076571c51e2ea8be5f26479edebe4"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node4","blskey":"2zN3bHM1m4rLz54MJHYSwvqzPchYp8jkHswveCLAEJVcX6Mm1wHQD1SkPYMzUDTZvWvhuE6VNAkK3KxVeEmsanSmvjVkReDeBEMxeDaayjcZjFGPydyey1qxBHmTvAnBKoPydvuTAqx5f7YNNRAdeLmUi99gERUU7TD8KfAa6MpQ9bw","client_ip":"13.113.117.92","client_port":9708,"node_ip":"13.113.117.92","node_port":9707,"services":["VALIDATOR"]},"dest":"4PS3EDQ3dW1tci1Bp6543CfuuebjFrg36kLAUcskGfaA"},"metadata":{"from":"TWwCRQRZ2ZHMJFn9TzLp7W"},"type":"0"},"txnMetadata":{"seqNo":4,"txnId":"aa5e817d7cc626170eca175822029339a444eb0ee8f0bd20d3b0b76e566fb008"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node5","blskey":"2JSLkTGhnG3ZzGoeuZufc7V1kF5wxHqTuSUbaudhwRJzsGZupNHs5igohLnsdcYG7kFj1JGC5aV2JuiJtDtHPKBeGw24ZmBJ44YYaqfCMi5ywNyP42aSjMkvjtHrGS7oVoFbP4aG4aRaKZL3UZbbGcnGTK5kfacmBNKdPSQDyXGCoxB","client_ip":"52.209.67.38","client_port":9710,"node_ip":"52.209.67.38","node_port":9709,"services":["VALIDATOR"]},"dest":"4SWokCJWJc69Tn74VvLS6t2G2ucvXqM9FDMsWJjmsUxe"},"metadata":{"from":"92PMXtzRGuTAhAK5xPbwqq"},"type":"0"},"txnMetadata":{"seqNo":5,"txnId":"5abef8bc27d85d53753c5b6ed0cd2e197998c21513a379bfcf44d9c7a73c3a7e"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node6","blskey":"3D5JAwAhjW5gik1ogKrnQaVrHY94e8E56iA5UifXjjYypMm2LifLiaRtgWJPiFA6uv2EiGy4MYByZ88Rmi8K3mUvb9TZeR9sdLBxsTdqrikeenac8ZVNkdCaFmGWcw8xVGqgv9cs574YDj7nuLHbJUDXN17J2fzQiD83iVQVQHW1RuU","client_ip":"35.170.106.44","client_port":9712,"node_ip":"35.170.106.44","node_port":9711,"services":["VALIDATOR"]},"dest":"Cv1Ehj43DDM5ttNBmC6VPpEfwXWwfGktHwjDJsTV5Fz8"},"metadata":{"from":"HaN1iLFgVfM31ssY4obfYN"},"type":"0"},"txnMetadata":{"seqNo":6,"txnId":"a23059dc16aaf4513f97ca91f272235e809f8bda8c40f6688b88615a2c318ff8"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node7","blskey":"4ahBpE7gVEhW2evVgS69EJeSyciwbbby67iQj4htsgdtCxxXsEHMS6oKVeEQvrBBgncHfAddQyTt7ZF1PcfMX1Gu3xsgnzBDcLzPBz6ZdoXwi3uDPEoDZHXeDp1AFj8cidhfBWzY1FfKZMvh1HYQX8zZWMw579pYs3SyNoWLNdsNd8Q","client_ip":"52.60.212.231","client_port":9714,"node_ip":"52.60.212.231","node_port":9713,"services":["VALIDATOR"]},"dest":"BM8dTooz5uykCbYSAAFwKNkYfT4koomBHsSWHTDtkjhW"},"metadata":{"from":"BgJMUfWjWZBDAsu251dtrF"},"type":"0"},"txnMetadata":{"seqNo":7,"txnId":"e5f11aa7ec7091ca6c31a826eec885da7fcaa47611d03fdc3562b48247f179cf"},"ver":"1"}',
  },
  [SERVER_ENVIRONMENT.DEVRC]: {
    agencyUrl: 'https://agency.pdev.evernym.com',
    agencyDID: 'LiLBGgFarh954ZtTByLM1C',
    agencyVerificationKey: 'Bk9wFrud3rz8v3nAFKGib6sQs8zHWzZxfst7Wh3Mbc9W',
    poolConfig:
      '{"reqSignature":{},"txn":{"data":{"data":{"alias":"australia","client_ip":"52.64.96.160","client_port":"9702","node_ip":"52.64.96.160","node_port":"9701","services":["VALIDATOR"]},"dest":"UZH61eLH3JokEwjMWQoCMwB3PMD6zRBvG6NCv5yVwXz"},"metadata":{"from":"3U8HUen8WcgpbnEz1etnai"},"type":"0"},"txnMetadata":{"seqNo":1,"txnId":"c585f1decb986f7ff19b8d03deba346ab8a0494cc1e4d69ad9b8acb0dfbeab6f"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"brazil","client_ip":"54.233.203.241","client_port":"9702","node_ip":"54.233.203.241","node_port":"9701","services":["VALIDATOR"]},"dest":"2MHGDD2XpRJohQzsXu4FAANcmdypfNdpcqRbqnhkQsCq"},"metadata":{"from":"G3knUCmDrWd1FJrRryuKTw"},"type":"0"},"txnMetadata":{"seqNo":2,"txnId":"5c8f52ca28966103ff0aad98160bc8e978c9ca0285a2043a521481d11ed17506"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"canada","client_ip":"52.60.207.225","client_port":"9702","node_ip":"52.60.207.225","node_port":"9701","services":["VALIDATOR"]},"dest":"8NZ6tbcPN2NVvf2fVhZWqU11XModNudhbe15JSctCXab"},"metadata":{"from":"22QmMyTEAbaF4VfL7LameE"},"type":"0"},"txnMetadata":{"seqNo":3,"txnId":"408c7c5887a0f3905767754f424989b0089c14ac502d7f851d11b31ea2d1baa6"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"england","client_ip":"52.56.191.9","client_port":"9702","node_ip":"52.56.191.9","node_port":"9701","services":["VALIDATOR"]},"dest":"DNuLANU7f1QvW1esN3Sv9Eap9j14QuLiPeYzf28Nub4W"},"metadata":{"from":"NYh3bcUeSsJJcxBE6TTmEr"},"type":"0"},"txnMetadata":{"seqNo":4,"txnId":"d56d0ff69b62792a00a361fbf6e02e2a634a7a8da1c3e49d59e71e0f19c27875"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"korea","client_ip":"52.79.115.223","client_port":"9702","node_ip":"52.79.115.223","node_port":"9701","services":["VALIDATOR"]},"dest":"HCNuqUoXuK9GXGd2EULPaiMso2pJnxR6fCZpmRYbc7vM"},"metadata":{"from":"U38UHML5A1BQ1mYh7tYXeu"},"type":"0"},"txnMetadata":{"seqNo":5,"txnId":"76201e78aca720dbaf516d86d9342ad5b5d46f5badecf828eb9edfee8ab48a50"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"singapore","client_ip":"13.228.62.7","client_port":"9702","node_ip":"13.228.62.7","node_port":"9701","services":["VALIDATOR"]},"dest":"Dh99uW8jSNRBiRQ4JEMpGmJYvzmF35E6ibnmAAf7tbk8"},"metadata":{"from":"HfXThVwhJB4o1Q1Fjr4yrC"},"type":"0"},"txnMetadata":{"seqNo":6,"txnId":"51e2a46721d104d9148d85b617833e7745fdbd6795cb0b502a5b6ea31d33378e"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"virginia","client_ip":"34.225.215.131","client_port":"9702","node_ip":"34.225.215.131","node_port":"9701","services":["VALIDATOR"]},"dest":"EoGRm7eRADtHJRThMCrBXMUM2FpPRML19tNxDAG8YTP8"},"metadata":{"from":"SPdfHq6rGcySFVjDX4iyCo"},"type":"0"},"txnMetadata":{"seqNo":7,"txnId":"0a4992ea442b53e3dca861deac09a8d4987004a8483079b12861080ea4aa1b52"},"ver":"1"}',
  },
  [SERVER_ENVIRONMENT.QARC]: {
    agencyUrl: 'https://agency.pqa.evernym.com',
    agencyDID: 'LhiSANFohRXBWaKSZDvTH5',
    agencyVerificationKey: 'BjpTLofEbVYJ8xxXQxScbmubHsgpHY5uvScfXqW9B1vB',
    poolConfig:
      '{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node1","blskey":"4N8aUNHSgjQVgkpm8nhNEfDf6txHznoYREg9kirmJrkivgL4oSEimFF6nsQ6M41QvhM2Z33nves5vfSn9n1UwNFJBYtWVnHYMATn76vLuL3zU88KyeAYcHfsih3He6UHcXDxcaecHVz6jhCYz1P2UZn2bDVruL5wXpehgBfBaLKm3Ba","client_ip":"54.233.136.74","client_port":9702,"node_ip":"54.233.136.74","node_port":9701,"services":["VALIDATOR"]},"dest":"Gw6pDLhcBcoQesN72qfotTgFa7cbuqZpkX3Xo6pLhPhv"},"metadata":{"from":"Th7MpTaRZVRYnPiabds81Y"},"type":"0"},"txnMetadata":{"seqNo":1,"txnId":"fea82e10e894419fe2bea7d96296a6d46f50f93f9eeda954ec461b2ed2950b62"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node2","blskey":"37rAPpXVoxzKhz7d9gkUe52XuXryuLXoM6P6LbWDB7LSbG62Lsb33sfG7zqS8TK1MXwuCHj1FKNzVpsnafmqLG1vXN88rt38mNFs9TENzm4QHdBzsvCuoBnPH7rpYYDo9DZNJePaDvRvqJKByCabubJz3XXKbEeshzpz4Ma5QYpJqjk","client_ip":"13.228.112.216","client_port":9704,"node_ip":"13.228.112.216","node_port":9703,"services":["VALIDATOR"]},"dest":"8ECVSk179mjsjKRLWiQtssMLgp6EPhWXtaYyStWPSGAb"},"metadata":{"from":"EbP4aYNeTHL6q385GuVpRV"},"type":"0"},"txnMetadata":{"seqNo":2,"txnId":"1ac8aece2a18ced660fef8694b61aac3af08ba875ce3026a160acbc3a3af35fc"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node3","blskey":"3WFpdbg7C5cnLYZwFZevJqhubkFALBfCBBok15GdrKMUhUjGsk3jV6QKj6MZgEubF7oqCafxNdkm7eswgA4sdKTRc82tLGzZBd6vNqU8dupzup6uYUf32KTHTPQbuUM8Yk4QFXjEf2Usu2TJcNkdgpyeUSX42u5LqdDDpNSWUK5deC5","client_ip":"13.54.146.111","client_port":9706,"node_ip":"13.54.146.111","node_port":9705,"services":["VALIDATOR"]},"dest":"DKVxG2fXXTU8yT5N7hGEbXB3dfdAnYv1JczDUHpmDxya"},"metadata":{"from":"4cU41vWW82ArfxJxHkzXPG"},"type":"0"},"txnMetadata":{"seqNo":3,"txnId":"7e9f355dffa78ed24668f0e0e369fd8c224076571c51e2ea8be5f26479edebe4"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node4","blskey":"2zN3bHM1m4rLz54MJHYSwvqzPchYp8jkHswveCLAEJVcX6Mm1wHQD1SkPYMzUDTZvWvhuE6VNAkK3KxVeEmsanSmvjVkReDeBEMxeDaayjcZjFGPydyey1qxBHmTvAnBKoPydvuTAqx5f7YNNRAdeLmUi99gERUU7TD8KfAa6MpQ9bw","client_ip":"13.113.117.92","client_port":9708,"node_ip":"13.113.117.92","node_port":9707,"services":["VALIDATOR"]},"dest":"4PS3EDQ3dW1tci1Bp6543CfuuebjFrg36kLAUcskGfaA"},"metadata":{"from":"TWwCRQRZ2ZHMJFn9TzLp7W"},"type":"0"},"txnMetadata":{"seqNo":4,"txnId":"aa5e817d7cc626170eca175822029339a444eb0ee8f0bd20d3b0b76e566fb008"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node5","blskey":"2JSLkTGhnG3ZzGoeuZufc7V1kF5wxHqTuSUbaudhwRJzsGZupNHs5igohLnsdcYG7kFj1JGC5aV2JuiJtDtHPKBeGw24ZmBJ44YYaqfCMi5ywNyP42aSjMkvjtHrGS7oVoFbP4aG4aRaKZL3UZbbGcnGTK5kfacmBNKdPSQDyXGCoxB","client_ip":"52.209.67.38","client_port":9710,"node_ip":"52.209.67.38","node_port":9709,"services":["VALIDATOR"]},"dest":"4SWokCJWJc69Tn74VvLS6t2G2ucvXqM9FDMsWJjmsUxe"},"metadata":{"from":"92PMXtzRGuTAhAK5xPbwqq"},"type":"0"},"txnMetadata":{"seqNo":5,"txnId":"5abef8bc27d85d53753c5b6ed0cd2e197998c21513a379bfcf44d9c7a73c3a7e"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node6","blskey":"3D5JAwAhjW5gik1ogKrnQaVrHY94e8E56iA5UifXjjYypMm2LifLiaRtgWJPiFA6uv2EiGy4MYByZ88Rmi8K3mUvb9TZeR9sdLBxsTdqrikeenac8ZVNkdCaFmGWcw8xVGqgv9cs574YDj7nuLHbJUDXN17J2fzQiD83iVQVQHW1RuU","client_ip":"35.170.106.44","client_port":9712,"node_ip":"35.170.106.44","node_port":9711,"services":["VALIDATOR"]},"dest":"Cv1Ehj43DDM5ttNBmC6VPpEfwXWwfGktHwjDJsTV5Fz8"},"metadata":{"from":"HaN1iLFgVfM31ssY4obfYN"},"type":"0"},"txnMetadata":{"seqNo":6,"txnId":"a23059dc16aaf4513f97ca91f272235e809f8bda8c40f6688b88615a2c318ff8"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node7","blskey":"4ahBpE7gVEhW2evVgS69EJeSyciwbbby67iQj4htsgdtCxxXsEHMS6oKVeEQvrBBgncHfAddQyTt7ZF1PcfMX1Gu3xsgnzBDcLzPBz6ZdoXwi3uDPEoDZHXeDp1AFj8cidhfBWzY1FfKZMvh1HYQX8zZWMw579pYs3SyNoWLNdsNd8Q","client_ip":"52.60.212.231","client_port":9714,"node_ip":"52.60.212.231","node_port":9713,"services":["VALIDATOR"]},"dest":"BM8dTooz5uykCbYSAAFwKNkYfT4koomBHsSWHTDtkjhW"},"metadata":{"from":"BgJMUfWjWZBDAsu251dtrF"},"type":"0"},"txnMetadata":{"seqNo":7,"txnId":"e5f11aa7ec7091ca6c31a826eec885da7fcaa47611d03fdc3562b48247f179cf"},"ver":"1"}',
  },
  [SERVER_ENVIRONMENT.DEVTEAM1]: {
    agencyUrl: 'https://agency-team1.pdev.evernym.com',
    agencyDID: 'TGLBMTcW9fHdkSqown9jD8',
    agencyVerificationKey: 'FKGV9jKvorzKPtPJPNLZkYPkLhiS1VbxdvBgd1RjcQHR',
    poolConfig:
      '{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node1","blskey":"4N8aUNHSgjQVgkpm8nhNEfDf6txHznoYREg9kirmJrkivgL4oSEimFF6nsQ6M41QvhM2Z33nves5vfSn9n1UwNFJBYtWVnHYMATn76vLuL3zU88KyeAYcHfsih3He6UHcXDxcaecHVz6jhCYz1P2UZn2bDVruL5wXpehgBfBaLKm3Ba","blskey_pop":"RahHYiCvoNCtPTrVtP7nMC5eTYrsUA8WjXbdhNc8debh1agE9bGiJxWBXYNFbnJXoXhWFMvyqhqhRoq737YQemH5ik9oL7R4NTTCz2LEZhkgLJzB3QRQqJyBNyv7acbdHrAT8nQ9UkLbaVL9NBpnWXBTw4LEMePaSHEw66RzPNdAX1","client_ip":"54.71.181.31","client_port":9702,"node_ip":"54.71.181.31","node_port":9701,"services":["VALIDATOR"]},"dest":"Gw6pDLhcBcoQesN72qfotTgFa7cbuqZpkX3Xo6pLhPhv"},"metadata":{"from":"Th7MpTaRZVRYnPiabds81Y"},"type":"0"},"txnMetadata":{"seqNo":1,"txnId":"fea82e10e894419fe2bea7d96296a6d46f50f93f9eeda954ec461b2ed2950b62"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node2","blskey":"37rAPpXVoxzKhz7d9gkUe52XuXryuLXoM6P6LbWDB7LSbG62Lsb33sfG7zqS8TK1MXwuCHj1FKNzVpsnafmqLG1vXN88rt38mNFs9TENzm4QHdBzsvCuoBnPH7rpYYDo9DZNJePaDvRvqJKByCabubJz3XXKbEeshzpz4Ma5QYpJqjk","blskey_pop":"Qr658mWZ2YC8JXGXwMDQTzuZCWF7NK9EwxphGmcBvCh6ybUuLxbG65nsX4JvD4SPNtkJ2w9ug1yLTj6fgmuDg41TgECXjLCij3RMsV8CwewBVgVN67wsA45DFWvqvLtu4rjNnE9JbdFTc1Z4WCPA3Xan44K1HoHAq9EVeaRYs8zoF5","client_ip":"54.71.181.31","client_port":9704,"node_ip":"54.71.181.31","node_port":9703,"services":["VALIDATOR"]},"dest":"8ECVSk179mjsjKRLWiQtssMLgp6EPhWXtaYyStWPSGAb"},"metadata":{"from":"EbP4aYNeTHL6q385GuVpRV"},"type":"0"},"txnMetadata":{"seqNo":2,"txnId":"1ac8aece2a18ced660fef8694b61aac3af08ba875ce3026a160acbc3a3af35fc"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node3","blskey":"3WFpdbg7C5cnLYZwFZevJqhubkFALBfCBBok15GdrKMUhUjGsk3jV6QKj6MZgEubF7oqCafxNdkm7eswgA4sdKTRc82tLGzZBd6vNqU8dupzup6uYUf32KTHTPQbuUM8Yk4QFXjEf2Usu2TJcNkdgpyeUSX42u5LqdDDpNSWUK5deC5","blskey_pop":"QwDeb2CkNSx6r8QC8vGQK3GRv7Yndn84TGNijX8YXHPiagXajyfTjoR87rXUu4G4QLk2cF8NNyqWiYMus1623dELWwx57rLCFqGh7N4ZRbGDRP4fnVcaKg1BcUxQ866Ven4gw8y4N56S5HzxXNBZtLYmhGHvDtk6PFkFwCvxYrNYjh","client_ip":"54.71.181.31","client_port":9706,"node_ip":"54.71.181.31","node_port":9705,"services":["VALIDATOR"]},"dest":"DKVxG2fXXTU8yT5N7hGEbXB3dfdAnYv1JczDUHpmDxya"},"metadata":{"from":"4cU41vWW82ArfxJxHkzXPG"},"type":"0"},"txnMetadata":{"seqNo":3,"txnId":"7e9f355dffa78ed24668f0e0e369fd8c224076571c51e2ea8be5f26479edebe4"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node4","blskey":"2zN3bHM1m4rLz54MJHYSwvqzPchYp8jkHswveCLAEJVcX6Mm1wHQD1SkPYMzUDTZvWvhuE6VNAkK3KxVeEmsanSmvjVkReDeBEMxeDaayjcZjFGPydyey1qxBHmTvAnBKoPydvuTAqx5f7YNNRAdeLmUi99gERUU7TD8KfAa6MpQ9bw","blskey_pop":"RPLagxaR5xdimFzwmzYnz4ZhWtYQEj8iR5ZU53T2gitPCyCHQneUn2Huc4oeLd2B2HzkGnjAff4hWTJT6C7qHYB1Mv2wU5iHHGFWkhnTX9WsEAbunJCV2qcaXScKj4tTfvdDKfLiVuU2av6hbsMztirRze7LvYBkRHV3tGwyCptsrP","client_ip":"54.71.181.31","client_port":9708,"node_ip":"54.71.181.31","node_port":9707,"services":["VALIDATOR"]},"dest":"4PS3EDQ3dW1tci1Bp6543CfuuebjFrg36kLAUcskGfaA"},"metadata":{"from":"TWwCRQRZ2ZHMJFn9TzLp7W"},"type":"0"},"txnMetadata":{"seqNo":4,"txnId":"aa5e817d7cc626170eca175822029339a444eb0ee8f0bd20d3b0b76e566fb008"},"ver":"1"}',
  },
  [SERVER_ENVIRONMENT.DEVTEAM2]: {
    agencyUrl: 'https://agency-team2.pdev.evernym.com',
    agencyDID: 'TGLBMTcW9fHdkSqown9jD8',
    agencyVerificationKey: 'FKGV9jKvorzKPtPJPNLZkYPkLhiS1VbxdvBgd1RjcQHR',
    poolConfig:
      '{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node1","blskey":"4N8aUNHSgjQVgkpm8nhNEfDf6txHznoYREg9kirmJrkivgL4oSEimFF6nsQ6M41QvhM2Z33nves5vfSn9n1UwNFJBYtWVnHYMATn76vLuL3zU88KyeAYcHfsih3He6UHcXDxcaecHVz6jhCYz1P2UZn2bDVruL5wXpehgBfBaLKm3Ba","blskey_pop":"RahHYiCvoNCtPTrVtP7nMC5eTYrsUA8WjXbdhNc8debh1agE9bGiJxWBXYNFbnJXoXhWFMvyqhqhRoq737YQemH5ik9oL7R4NTTCz2LEZhkgLJzB3QRQqJyBNyv7acbdHrAT8nQ9UkLbaVL9NBpnWXBTw4LEMePaSHEw66RzPNdAX1","client_ip":"35.160.9.251","client_port":9702,"node_ip":"35.160.9.251","node_port":9701,"services":["VALIDATOR"]},"dest":"Gw6pDLhcBcoQesN72qfotTgFa7cbuqZpkX3Xo6pLhPhv"},"metadata":{"from":"Th7MpTaRZVRYnPiabds81Y"},"type":"0"},"txnMetadata":{"seqNo":1,"txnId":"fea82e10e894419fe2bea7d96296a6d46f50f93f9eeda954ec461b2ed2950b62"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node2","blskey":"37rAPpXVoxzKhz7d9gkUe52XuXryuLXoM6P6LbWDB7LSbG62Lsb33sfG7zqS8TK1MXwuCHj1FKNzVpsnafmqLG1vXN88rt38mNFs9TENzm4QHdBzsvCuoBnPH7rpYYDo9DZNJePaDvRvqJKByCabubJz3XXKbEeshzpz4Ma5QYpJqjk","blskey_pop":"Qr658mWZ2YC8JXGXwMDQTzuZCWF7NK9EwxphGmcBvCh6ybUuLxbG65nsX4JvD4SPNtkJ2w9ug1yLTj6fgmuDg41TgECXjLCij3RMsV8CwewBVgVN67wsA45DFWvqvLtu4rjNnE9JbdFTc1Z4WCPA3Xan44K1HoHAq9EVeaRYs8zoF5","client_ip":"35.160.9.251","client_port":9704,"node_ip":"35.160.9.251","node_port":9703,"services":["VALIDATOR"]},"dest":"8ECVSk179mjsjKRLWiQtssMLgp6EPhWXtaYyStWPSGAb"},"metadata":{"from":"EbP4aYNeTHL6q385GuVpRV"},"type":"0"},"txnMetadata":{"seqNo":2,"txnId":"1ac8aece2a18ced660fef8694b61aac3af08ba875ce3026a160acbc3a3af35fc"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node3","blskey":"3WFpdbg7C5cnLYZwFZevJqhubkFALBfCBBok15GdrKMUhUjGsk3jV6QKj6MZgEubF7oqCafxNdkm7eswgA4sdKTRc82tLGzZBd6vNqU8dupzup6uYUf32KTHTPQbuUM8Yk4QFXjEf2Usu2TJcNkdgpyeUSX42u5LqdDDpNSWUK5deC5","blskey_pop":"QwDeb2CkNSx6r8QC8vGQK3GRv7Yndn84TGNijX8YXHPiagXajyfTjoR87rXUu4G4QLk2cF8NNyqWiYMus1623dELWwx57rLCFqGh7N4ZRbGDRP4fnVcaKg1BcUxQ866Ven4gw8y4N56S5HzxXNBZtLYmhGHvDtk6PFkFwCvxYrNYjh","client_ip":"35.160.9.251","client_port":9706,"node_ip":"35.160.9.251","node_port":9705,"services":["VALIDATOR"]},"dest":"DKVxG2fXXTU8yT5N7hGEbXB3dfdAnYv1JczDUHpmDxya"},"metadata":{"from":"4cU41vWW82ArfxJxHkzXPG"},"type":"0"},"txnMetadata":{"seqNo":3,"txnId":"7e9f355dffa78ed24668f0e0e369fd8c224076571c51e2ea8be5f26479edebe4"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node4","blskey":"2zN3bHM1m4rLz54MJHYSwvqzPchYp8jkHswveCLAEJVcX6Mm1wHQD1SkPYMzUDTZvWvhuE6VNAkK3KxVeEmsanSmvjVkReDeBEMxeDaayjcZjFGPydyey1qxBHmTvAnBKoPydvuTAqx5f7YNNRAdeLmUi99gERUU7TD8KfAa6MpQ9bw","blskey_pop":"RPLagxaR5xdimFzwmzYnz4ZhWtYQEj8iR5ZU53T2gitPCyCHQneUn2Huc4oeLd2B2HzkGnjAff4hWTJT6C7qHYB1Mv2wU5iHHGFWkhnTX9WsEAbunJCV2qcaXScKj4tTfvdDKfLiVuU2av6hbsMztirRze7LvYBkRHV3tGwyCptsrP","client_ip":"35.160.9.251","client_port":9708,"node_ip":"35.160.9.251","node_port":9707,"services":["VALIDATOR"]},"dest":"4PS3EDQ3dW1tci1Bp6543CfuuebjFrg36kLAUcskGfaA"},"metadata":{"from":"TWwCRQRZ2ZHMJFn9TzLp7W"},"type":"0"},"txnMetadata":{"seqNo":4,"txnId":"aa5e817d7cc626170eca175822029339a444eb0ee8f0bd20d3b0b76e566fb008"},"ver":"1"}',
  },
  [SERVER_ENVIRONMENT.DEVTEAM3]: {
    agencyUrl: 'https://agency-team3.pdev.evernym.com',
    agencyDID: 'TGLBMTcW9fHdkSqown9jD8',
    agencyVerificationKey: 'FKGV9jKvorzKPtPJPNLZkYPkLhiS1VbxdvBgd1RjcQHR',
    poolConfig:
      '{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node1","blskey":"4N8aUNHSgjQVgkpm8nhNEfDf6txHznoYREg9kirmJrkivgL4oSEimFF6nsQ6M41QvhM2Z33nves5vfSn9n1UwNFJBYtWVnHYMATn76vLuL3zU88KyeAYcHfsih3He6UHcXDxcaecHVz6jhCYz1P2UZn2bDVruL5wXpehgBfBaLKm3Ba","blskey_pop":"RahHYiCvoNCtPTrVtP7nMC5eTYrsUA8WjXbdhNc8debh1agE9bGiJxWBXYNFbnJXoXhWFMvyqhqhRoq737YQemH5ik9oL7R4NTTCz2LEZhkgLJzB3QRQqJyBNyv7acbdHrAT8nQ9UkLbaVL9NBpnWXBTw4LEMePaSHEw66RzPNdAX1","client_ip":"34.217.237.253","client_port":9702,"node_ip":"34.217.237.253","node_port":9701,"services":["VALIDATOR"]},"dest":"Gw6pDLhcBcoQesN72qfotTgFa7cbuqZpkX3Xo6pLhPhv"},"metadata":{"from":"Th7MpTaRZVRYnPiabds81Y"},"type":"0"},"txnMetadata":{"seqNo":1,"txnId":"fea82e10e894419fe2bea7d96296a6d46f50f93f9eeda954ec461b2ed2950b62"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node2","blskey":"37rAPpXVoxzKhz7d9gkUe52XuXryuLXoM6P6LbWDB7LSbG62Lsb33sfG7zqS8TK1MXwuCHj1FKNzVpsnafmqLG1vXN88rt38mNFs9TENzm4QHdBzsvCuoBnPH7rpYYDo9DZNJePaDvRvqJKByCabubJz3XXKbEeshzpz4Ma5QYpJqjk","blskey_pop":"Qr658mWZ2YC8JXGXwMDQTzuZCWF7NK9EwxphGmcBvCh6ybUuLxbG65nsX4JvD4SPNtkJ2w9ug1yLTj6fgmuDg41TgECXjLCij3RMsV8CwewBVgVN67wsA45DFWvqvLtu4rjNnE9JbdFTc1Z4WCPA3Xan44K1HoHAq9EVeaRYs8zoF5","client_ip":"34.217.237.253","client_port":9704,"node_ip":"34.217.237.253","node_port":9703,"services":["VALIDATOR"]},"dest":"8ECVSk179mjsjKRLWiQtssMLgp6EPhWXtaYyStWPSGAb"},"metadata":{"from":"EbP4aYNeTHL6q385GuVpRV"},"type":"0"},"txnMetadata":{"seqNo":2,"txnId":"1ac8aece2a18ced660fef8694b61aac3af08ba875ce3026a160acbc3a3af35fc"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node3","blskey":"3WFpdbg7C5cnLYZwFZevJqhubkFALBfCBBok15GdrKMUhUjGsk3jV6QKj6MZgEubF7oqCafxNdkm7eswgA4sdKTRc82tLGzZBd6vNqU8dupzup6uYUf32KTHTPQbuUM8Yk4QFXjEf2Usu2TJcNkdgpyeUSX42u5LqdDDpNSWUK5deC5","blskey_pop":"QwDeb2CkNSx6r8QC8vGQK3GRv7Yndn84TGNijX8YXHPiagXajyfTjoR87rXUu4G4QLk2cF8NNyqWiYMus1623dELWwx57rLCFqGh7N4ZRbGDRP4fnVcaKg1BcUxQ866Ven4gw8y4N56S5HzxXNBZtLYmhGHvDtk6PFkFwCvxYrNYjh","client_ip":"34.217.237.253","client_port":9706,"node_ip":"34.217.237.253","node_port":9705,"services":["VALIDATOR"]},"dest":"DKVxG2fXXTU8yT5N7hGEbXB3dfdAnYv1JczDUHpmDxya"},"metadata":{"from":"4cU41vWW82ArfxJxHkzXPG"},"type":"0"},"txnMetadata":{"seqNo":3,"txnId":"7e9f355dffa78ed24668f0e0e369fd8c224076571c51e2ea8be5f26479edebe4"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node4","blskey":"2zN3bHM1m4rLz54MJHYSwvqzPchYp8jkHswveCLAEJVcX6Mm1wHQD1SkPYMzUDTZvWvhuE6VNAkK3KxVeEmsanSmvjVkReDeBEMxeDaayjcZjFGPydyey1qxBHmTvAnBKoPydvuTAqx5f7YNNRAdeLmUi99gERUU7TD8KfAa6MpQ9bw","blskey_pop":"RPLagxaR5xdimFzwmzYnz4ZhWtYQEj8iR5ZU53T2gitPCyCHQneUn2Huc4oeLd2B2HzkGnjAff4hWTJT6C7qHYB1Mv2wU5iHHGFWkhnTX9WsEAbunJCV2qcaXScKj4tTfvdDKfLiVuU2av6hbsMztirRze7LvYBkRHV3tGwyCptsrP","client_ip":"34.217.237.253","client_port":9708,"node_ip":"34.217.237.253","node_port":9707,"services":["VALIDATOR"]},"dest":"4PS3EDQ3dW1tci1Bp6543CfuuebjFrg36kLAUcskGfaA"},"metadata":{"from":"TWwCRQRZ2ZHMJFn9TzLp7W"},"type":"0"},"txnMetadata":{"seqNo":4,"txnId":"aa5e817d7cc626170eca175822029339a444eb0ee8f0bd20d3b0b76e566fb008"},"ver":"1"}',
  },
  [SERVER_ENVIRONMENT.PROD]: {
    agencyUrl: 'https://agency.evernym.com',
    agencyDID: 'DwXzE7GdE5DNfsrRXJChSD',
    agencyVerificationKey: '844sJfb2snyeEugKvpY7Y4jZJk9LT6BnS6bnuKoiqbip',
    poolConfig:
      '{"reqSignature":{},"txn":{"data":{"data":{"alias":"ev1","client_ip":"54.207.36.81","client_port":"9702","node_ip":"18.231.96.215","node_port":"9701","services":["VALIDATOR"]},"dest":"GWgp6huggos5HrzHVDy5xeBkYHxPvrRZzjPNAyJAqpjA"},"metadata":{"from":"J4N1K1SEB8uY2muwmecY5q"},"type":"0"},"txnMetadata":{"seqNo":1,"txnId":"b0c82a3ade3497964cb8034be915da179459287823d92b5717e6d642784c50e6"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"zaValidator","client_ip":"154.0.164.39","client_port":"9702","node_ip":"154.0.164.39","node_port":"9701","services":["VALIDATOR"]},"dest":"BnubzSjE3dDVakR77yuJAuDdNajBdsh71ZtWePKhZTWe"},"metadata":{"from":"UoFyxT8BAqotbkhiehxHCn"},"type":"0"},"txnMetadata":{"seqNo":2,"txnId":"d5f775f65e44af60ff69cfbcf4f081cd31a218bf16a941d949339dadd55024d0"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"danube","client_ip":"128.130.204.35","client_port":"9722","node_ip":"128.130.204.35","node_port":"9721","services":["VALIDATOR"]},"dest":"476kwEjDj5rxH5ZcmTtgnWqDbAnYJAGGMgX7Sq183VED"},"metadata":{"from":"BrYDA5NubejDVHkCYBbpY5"},"type":"0"},"txnMetadata":{"seqNo":3,"txnId":"ebf340b317c044d970fcd0ca018d8903726fa70c8d8854752cd65e29d443686c"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"royal_sovrin","client_ip":"35.167.133.255","client_port":"9702","node_ip":"35.167.133.255","node_port":"9701","services":["VALIDATOR"]},"dest":"Et6M1U7zXQksf7QM6Y61TtmXF1JU23nsHCwcp1M9S8Ly"},"metadata":{"from":"4ohadAwtb2kfqvXynfmfbq"},"type":"0"},"txnMetadata":{"seqNo":4,"txnId":"24d391604c62e0e142ea51c6527481ae114722102e27f7878144d405d40df88d"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"digitalbazaar","client_ip":"34.226.105.29","client_port":"9701","node_ip":"34.226.105.29","node_port":"9700","services":["VALIDATOR"]},"dest":"D9oXgXC3b6ms3bXxrUu6KqR65TGhmC1eu7SUUanPoF71"},"metadata":{"from":"rckdVhnC5R5WvdtC83NQp"},"type":"0"},"txnMetadata":{"seqNo":5,"txnId":"56e1af48ef806615659304b1e5cf3ebf87050ad48e6310c5e8a8d9332ac5c0d8"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"OASFCU","client_ip":"38.70.17.248","client_port":"9702","node_ip":"38.70.17.248","node_port":"9701","services":["VALIDATOR"]},"dest":"8gM8NHpq2cE13rJYF33iDroEGiyU6wWLiU1jd2J4jSBz"},"metadata":{"from":"BFAeui85mkcuNeQQhZfqQY"},"type":"0"},"txnMetadata":{"seqNo":6,"txnId":"825aeaa33bc238449ec9bd58374b2b747a0b4859c5418da0ad201e928c3049ad"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"BIGAWSUSEAST1-001","client_ip":"34.224.255.108","client_port":"9796","node_ip":"34.224.255.108","node_port":"9769","services":["VALIDATOR"]},"dest":"HMJedzRbFkkuijvijASW2HZvQ93ooEVprxvNhqhCJUti"},"metadata":{"from":"L851TgZcjr6xqh4w6vYa34"},"type":"0"},"txnMetadata":{"seqNo":7,"txnId":"40fceb5fea4dbcadbd270be6d5752980e89692151baf77a6bb64c8ade42ac148"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"DustStorm","client_ip":"207.224.246.57","client_port":"9712","node_ip":"207.224.246.57","node_port":"9711","services":["VALIDATOR"]},"dest":"8gGDjbrn6wdq6CEjwoVStjQCEj3r7FCxKrA5d3qqXxjm"},"metadata":{"from":"FjuHvTjq76Pr9kdZiDadqq"},"type":"0"},"txnMetadata":{"seqNo":8,"txnId":"6d1ee3eb2057b8435333b23f271ab5c255a598193090452e9767f1edf1b4c72b"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"prosovitor","client_ip":"138.68.240.143","client_port":"9711","node_ip":"138.68.240.143","node_port":"9710","services":["VALIDATOR"]},"dest":"C8W35r9D2eubcrnAjyb4F3PC3vWQS1BHDg7UvDkvdV6Q"},"metadata":{"from":"Y1ENo59jsXYvTeP378hKWG"},"type":"0"},"txnMetadata":{"seqNo":9,"txnId":"15f22de8c95ef194f6448cfc03e93aeef199b9b1b7075c5ea13cfef71985bd83"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"iRespond","client_ip":"52.187.10.28","client_port":"9702","node_ip":"52.187.10.28","node_port":"9701","services":["VALIDATOR"]},"dest":"3SD8yyJsK7iKYdesQjwuYbBGCPSs1Y9kYJizdwp2Q1zp"},"metadata":{"from":"JdJi97RRDH7Bx7khr1znAq"},"type":"0"},"txnMetadata":{"seqNo":10,"txnId":"b65ce086b631ed75722a4e1f28fc9cf6119b8bc695bbb77b7bdff53cfe0fc2e2"},"ver":"1"}',
  },
}

// making defaults sane so that developers don't need to remember
// what settings should be in dev environment
const isDevEnvironment = __DEV__ && process.env.NODE_ENV !== 'test'
const defaultEnvironment = isDevEnvironment
  ? SERVER_ENVIRONMENT.DEVELOPMENT
  : SERVER_ENVIRONMENT.PROD

const initialState: ConfigStore = {
  ...baseUrls[defaultEnvironment],
  isAlreadyInstalled: false,
  // this flag is used to identify if we got the already stored data
  // from the phone and loaded in app
  isHydrated: false,
  // configurable error alert messages
  showErrorAlerts: false,
  // used to track if vcx is initialized successfully
  // if vcx is not initialized, then we won't be able
  // to call bridge methods that deals claims, connections, proofs, etc.
  vcxInitializationState: VCX_INIT_NOT_STARTED,
  vcxInitializationError: null,
  isInitialized: false,
}

export const hydrated = () => ({
  type: HYDRATED,
})

export const initialized = () => ({
  type: INITIALIZED,
})

export const alreadyInstalledAction = (isAlreadyInstalled: boolean) => ({
  type: ALREADY_INSTALLED_RESULT,
  isAlreadyInstalled,
})

export const appInstalledSuccess = () => ({
  type: APP_INSTALLED,
})

export const changeEnvironmentUrl = (url: string) => ({
  type: CHANGE_ENVIRONMENT_VIA_URL,
  url,
})

export const reset = () => ({
  type: RESET,
})

export function* resetStore(): Generator<*, *, *> {
  yield put(reset())
}

export function* onChangeEnvironmentUrl(
  action: ChangeEnvironmentUrlAction
): Generator<*, *, *> {
  try {
    const { url } = action
    const environmentDetails: EnvironmentDetailUrlDownloaded = yield call(
      downloadEnvironmentDetails,
      url
    )
    if (
      !schemaValidator.validate(
        schemaDownloadedEnvironmentDetails,
        environmentDetails
      )
    ) {
      // TODO: We need to make a component which displays message
      // in whole app, something like toast in android
      // for now, we are using native alert to show error and messages
      Alert.alert(
        MESSAGE_FAIL_ENVIRONMENT_SWITCH_TITLE,
        MESSAGE_FAIL_ENVIRONMENT_SWITCH_INVALID_DATA(url)
      )

      return
    }

    // TODO:KS When we pick up environment switch story using QR code
    // then we need to fix below stuff
    // yield* deleteDeviceSpecificData()
    // yield* deleteWallet()
    yield* resetStore()

    yield put(
      changeEnvironment(
        environmentDetails.agencyUrl,
        environmentDetails.agencyDID,
        environmentDetails.agencyVerificationKey,
        environmentDetails.poolConfig
      )
    )

    const pushToken: string = yield select(getPushToken)
    yield put(updatePushToken(pushToken))
    // TODO Un-comment and call vcx reset when we re-enable this feature
    // yield call(reset, environmentDetails.poolConfig)
    yield put(vcxInitReset())

    // if we did not get any exception till this point
    // that means environment is switched
    Alert.alert(
      MESSAGE_SUCCESS_ENVIRONMENT_SWITCH_TITLE,
      MESSAGE_SUCCESS_ENVIRONMENT_SWITCH_DESCRIPTION
    )
  } catch (e) {
    captureError(e)
    Alert.alert(
      MESSAGE_FAIL_ENVIRONMENT_SWITCH_TITLE,
      MESSAGE_FAIL_ENVIRONMENT_SWITCH_ERROR(e.message)
    )
  }
}

export function* watchChangeEnvironmentUrl(): any {
  yield takeLatest(CHANGE_ENVIRONMENT_VIA_URL, onChangeEnvironmentUrl)
}

export const changeEnvironment = (
  agencyUrl: string,
  agencyDID: string,
  agencyVerificationKey: string,
  poolConfig: string
) => {
  let updatedPoolConfig = poolConfig

  // We can get pool config from user that does not have \n
  // or it might contain \\n or it might contain just \n
  if (poolConfig) {
    if (poolConfig.indexOf('\\n') > -1) {
      updatedPoolConfig = poolConfig.split('\\n').join('\n')
    }

    // TODO: Raise error about invalid pool config
  }

  let updatedAgencyUrl = agencyUrl.trim()
  const endIndex = agencyUrl.length - 1

  if (updatedAgencyUrl[endIndex] === '/') {
    // if we got the agency url that ends to with '/'
    // then we save it after removing that slash
    updatedAgencyUrl = updatedAgencyUrl.slice(0, endIndex)
  }

  return {
    type: SWITCH_ENVIRONMENT,
    poolConfig: updatedPoolConfig,
    agencyDID,
    agencyVerificationKey,
    agencyUrl: updatedAgencyUrl,
  }
}

export const saveSwitchedEnvironmentDetailFail = (error: CustomError) => ({
  type: SAVE_SWITCH_ENVIRONMENT_DETAIL_FAIL,
  error,
})

export function* onEnvironmentSwitch(
  action: SwitchEnvironmentAction
): Generator<*, *, *> {
  const { type, ...switchedEnvironmentDetail } = action
  try {
    yield call(
      secureSet,
      STORAGE_KEY_SWITCHED_ENVIRONMENT_DETAIL,
      JSON.stringify(switchedEnvironmentDetail)
    )
  } catch (e) {
    captureError(e)
    // we need to add some fallback if user storage is not available
    // or is full or if user deleted our data
    yield put(
      saveSwitchedEnvironmentDetailFail({
        code: ERROR_SAVE_SWITCH_ENVIRONMENT.code,
        message: `${ERROR_SAVE_SWITCH_ENVIRONMENT.message}${e.message}`,
      })
    )
  }
}

export function* watchSwitchEnvironment(): any {
  yield takeLatest(SWITCH_ENVIRONMENT, onEnvironmentSwitch)
}

export function* hydrateSwitchedEnvironmentDetails(): any {
  try {
    const switchedEnvironmentDetail: string | null = yield call(
      getHydrationItem,
      STORAGE_KEY_SWITCHED_ENVIRONMENT_DETAIL
    )
    if (switchedEnvironmentDetail) {
      const {
        agencyUrl,
        agencyDID,
        agencyVerificationKey,
        poolConfig,
      }: ChangeEnvironment = JSON.parse(switchedEnvironmentDetail)
      yield put(
        changeEnvironment(
          agencyUrl,
          agencyDID,
          agencyVerificationKey,
          poolConfig
        )
      )
    }
  } catch (e) {
    captureError(e)
    yield put(
      hydrateSwitchedEnvironmentDetailFail({
        code: ERROR_HYDRATE_SWITCH_ENVIRONMENT.code,
        message: `${ERROR_HYDRATE_SWITCH_ENVIRONMENT.message}${e.message}`,
      })
    )
  }
}

export const hydrateSwitchedEnvironmentDetailFail = (error: CustomError) => ({
  type: HYDRATE_SWITCH_ENVIRONMENT_DETAIL_FAIL,
  error,
})

export const changeServerEnvironment = (
  serverEnvironment: ServerEnvironment
): ServerEnvironmentChangedAction => ({
  type: SERVER_ENVIRONMENT_CHANGED,
  serverEnvironment,
})

export const switchErrorAlerts = () => ({
  type: SWITCH_ERROR_ALERTS,
})

export const toggleErrorAlerts = (isShowErrorAlert: boolean) => ({
  type: TOGGLE_ERROR_ALERTS,
  isShowErrorAlert,
})

export function* watchSwitchErrorAlerts(): any {
  while (true) {
    for (let i = 0; i < 4; i++) {
      yield take(SWITCH_ERROR_ALERTS)
    }

    const switchValue = yield select(getErrorAlertsSwitchValue)
    yield put(toggleErrorAlerts(!switchValue))
  }
}

export const vcxInitStart = () => ({
  type: VCX_INIT_START,
})

export const vcxInitSuccess = () => ({
  type: VCX_INIT_SUCCESS,
})

export const vcxInitFail = (error: CustomError) => ({
  type: VCX_INIT_FAIL,
  error,
})

export const vcxInitReset = () => ({
  type: VCX_INIT_NOT_STARTED,
})

export function* ensureAppHydrated(): Generator<*, *, *> {
  const isHydrated = yield select(getHydrationState)
  if (!isHydrated) {
    yield take(HYDRATED)
  }
}

export function* initVcx(): Generator<*, *, *> {
  yield* ensureAppHydrated()
  // Since we have added a feature flag, so we need to wait
  // to know that user is going to enable the feature flag or not
  // now problem is how do we know when to stop waiting
  // so we are assuming that whenever user goes past lock-selection
  // screen, that means now user can't enable feature flag
  // because there is no way to enable that flag now
  const currentScreen: string = yield select(getCurrentScreen)
  if (UNSAFE_SCREENS_TO_DOWNLOAD_SMS.indexOf(currentScreen) > -1) {
    // user is on screens where he has chance to change environment details
    // so we wait for event which tells that we are safe
    yield take(SAFE_TO_DOWNLOAD_SMS_INVITATION)
  }

  // check if we already have user one time info
  // if we already have one time info, that means we don't have to register
  // with agency again, and we can just raise success action for VCX_INIT
  let userOneTimeInfo: UserOneTimeInfo = yield select(getUserOneTimeInfo)
  const {
    agencyUrl,
    agencyDID,
    agencyVerificationKey,
    poolConfig,
  }: ConfigStore = yield select(getConfig)
  const agencyConfig = {
    agencyUrl,
    agencyDID,
    agencyVerificationKey,
    poolConfig,
  }

  if (!userOneTimeInfo) {
    // app is hydrated, but we haven't got user one time info
    // so now we go ahead and create user one time info
    try {
      userOneTimeInfo = yield call(createOneTimeInfo, agencyConfig)
      yield put(connectRegisterCreateAgentDone(userOneTimeInfo))
    } catch (e) {
      captureError(e)
      yield call(vcxShutdown, false)
      yield put(vcxInitFail(ERROR_VCX_PROVISION_FAIL(e.message)))

      return
    }
  }

  // once we reach here, we are sure that either user one time info is loaded from disk
  // or we provisioned one time agent for current user if not already available

  // re-try vcx init 4 times, if it does not get success in 4 attempts, raise fail
  let retryCount = 0
  let lastInitException = new Error('')
  while (retryCount < 4) {
    try {
      yield call(
        init,
        {
          ...userOneTimeInfo,
          ...agencyConfig,
        },
        getGenesisFileName(agencyUrl)
      )
      yield put(vcxInitSuccess())
      break
    } catch (e) {
      captureError(e)
      lastInitException = e
      retryCount++
    }
  }

  if (retryCount > 3) {
    yield put(vcxInitFail(ERROR_VCX_INIT_FAIL(lastInitException.message)))
  }
}

export const getGenesisFileName = (agencyUrl: string) => {
  return (
    GENESIS_FILE_NAME +
    '_' +
    findKey(baseUrls, environment => environment.agencyUrl === agencyUrl)
  )
}

export function* watchVcxInitStart(): any {
  yield takeLatest(VCX_INIT_START, initVcx)
}

export function* ensureVcxInitSuccess(): Generator<*, *, *> {
  // vcx init ensures that
  // -- app is hydrated
  // -- user one time info is available
  // -- vcx initialization was success

  const vcxInitializationState = yield select(getVcxInitializationState)
  if (vcxInitializationState === VCX_INIT_SUCCESS) {
    // if already initialized, no need to process further
    return
  }

  if ([VCX_INIT_NOT_STARTED, VCX_INIT_FAIL].includes(vcxInitializationState)) {
    // if vcx init not started or vcx init failed and we want to init again
    yield put(vcxInitStart())
  }

  // if we are here, that means we either started vcx init
  // or vcx init was already in progress and now we need to wait for success
  return yield race({
    success: take(VCX_INIT_SUCCESS),
    fail: take(VCX_INIT_FAIL),
  })
}

export function* getMessagesSaga(): Generator<*, *, *> {
  try {
    //make sure vcx is initialized
    const vcxResult = yield* ensureVcxInitSuccess()
    if (vcxResult && vcxResult.fail) {
      yield take(VCX_INIT_SUCCESS)
    }
    const allConnectionsPairwiseDids = yield select(
      getAllConnectionsPairwiseDid
    )
    yield put(getMessagesLoading())
    const data = yield call(
      downloadMessages,
      MESSAGE_RESPONSE_CODE.MESSAGE_PENDING,
      null,
      allConnectionsPairwiseDids.join(',')
    )
    if (data && data.length != 0) {
      try {
        // Remove all the FCM notifications from the tray
        firebase.notifications().removeAllDeliveredNotifications()
        const parsedData: DownloadedConnectionsWithMessages = JSON.parse(data)
        yield* processMessages(parsedData)
        yield* acknowledgeServer(parsedData)
      } catch (e) {
        captureError(e)
        // throw error
      }
    }
    yield put(getMessagesSuccess())
  } catch (e) {
    captureError(e)
    //ask about retry scenario
    yield put(getMessagesFail())
  }
}

const traverseAndGetAllMessages = (
  data: DownloadedConnectionsWithMessages
): Array<DownloadedMessage> => {
  let messages: Array<DownloadedMessage> = []
  if (Array.isArray(data)) {
    data.map(
      connection =>
        connection &&
        connection.msgs &&
        connection.msgs.map(message => {
          messages.push(message)
        })
    )
  } else {
    return []
  }
  return messages
}

export function* processMessages(
  data: DownloadedConnectionsWithMessages
): Generator<*, *, *> {
  const msgTypes = [
    MESSAGE_TYPE.PROOF_REQUEST,
    MESSAGE_TYPE.CLAIM,
    MESSAGE_TYPE.CLAIM_OFFER,
  ]
  // send each message in data to handleMessage
  // additional data will be fetched and passed to relevant( claim, claimOffer, proofRequest,etc )store.
  const messages: Array<DownloadedMessage> = traverseAndGetAllMessages(data)
  const dataAlreadyExists = yield select(getPendingFetchAdditionalDataKey)
  for (let i = 0; i < messages.length; i++) {
    try {
      let connection = yield select(getConnection, messages[i].senderDID)
      let pairwiseDID = connection && connection[0].myPairwiseDid

      if (
        !(
          dataAlreadyExists &&
          dataAlreadyExists[`${messages[i].uid}-${pairwiseDID}`] &&
          msgTypes.indexOf(messages[i].type) > -1
        )
      ) {
        yield fork(handleMessage, messages[i])
      }
    } catch (e) {
      // capturing error for handleMessage fork
      captureError(e)
      customLogger.log(e)
    }
  }
}

const convertSerializedCredentialOfferToAditionalData = (
  convertedSerializedClaimOffer,
  senderName,
  senderDID
): ClaimOfferMessagePayload => {
  const vcxCredential = JSON.parse(convertedSerializedClaimOffer).data
  const {
    credential_offer: credentialOffer,
    payment_info: paymentInfo,
  } = vcxCredential

  const {
    msg_type,
    version,
    to_did,
    from_did,
    cred_def_id,
    credential_attrs: claim,
    claim_name,
    schema_seq_no,
  } = credentialOffer

  return {
    msg_type,
    version,
    to_did,
    from_did,
    cred_def_id,
    claim,
    claim_name,
    schema_seq_no,
    issuer_did: senderDID,
    issuer_name: senderName,
    remoteName: senderName,
    price:
      paymentInfo && paymentInfo.price ? paymentInfo.price.toString() : null,
  }
}

const convertToSerializedClaimOffer = (
  decryptedPayload: string,
  uid: string
) => {
  let claimOffer: SerializedClaimOfferData = {
    agent_did: null,
    agent_vk: null,
    cred_id: null,
    credential: null,
    credential_name: null,
    credential_offer: null,
    credential_request: null,
    msg_uid: null,
    my_did: null,
    my_vk: null,
    payment_info: null,
    payment_txn: null,
    source_id: uid,
    state: 3,
    their_did: null,
    their_vk: null,
  }
  const payload: ParsedDecryptedPayload = JSON.parse(decryptedPayload)
  const message: ParsedDecryptedPayloadMessage = JSON.parse(payload['@msg'])
  const msg0: MessageClaimOfferDetails | MessagePaymentDetails = message[0]
  const msg1: MessageClaimOfferDetails | MessagePaymentDetails = message[1]

  let credentialOffer: MessageClaimOfferDetails | null = null
  let paymentInfo: MessagePaymentDetails | null = null

  if (msg0 && msg0.claim_id) {
    credentialOffer = msg0
  } else if (msg1 && msg1.claim_id) {
    credentialOffer = msg1
  }

  if (msg0 && msg0.payment_addr) {
    paymentInfo = msg0
  } else if (msg1 && msg1.payment_addr) {
    paymentInfo = msg1
  }

  if (credentialOffer) {
    claimOffer.credential_offer = credentialOffer
    claimOffer.credential_offer.msg_ref_id = uid
    claimOffer.payment_info = paymentInfo
    return JSON.stringify({
      data: claimOffer,
      version: credentialOffer.version,
    })
  }

  return ''
}

const convertDecryptedPayloadToAdditionalPayload = (
  decryptedPayload: string,
  uid: string,
  senderName: string = '',
  proofHandle: number
): ProofRequestPushPayload => {
  const parsedPayload = JSON.parse(decryptedPayload)
  const parsedMsg: ProofRequest = JSON.parse(parsedPayload['@msg'])

  return {
    '@type': parsedMsg['@type'],
    '@topic': parsedMsg['@topic'],
    proof_request_data: parsedMsg.proof_request_data,
    remoteName: senderName,
    proofHandle,
  }
}

const convertDecryptedPayloadToSerializedProofRequest = (
  decryptedPayload: string,
  uid: string
) => {
  let stringifiableProofRequest: StringifiableProofRequest = {
    data: {
      agent_did: null,
      agent_vk: null,
      link_secret_alias: 'main',
      my_did: null,
      my_vk: null,
      proof: null,
      proof_request: null,
      source_id: uid,
      state: 3,
      their_did: null,
      their_vk: null,
    },
    version: '1.0',
  }

  const parsedPayload = JSON.parse(decryptedPayload)
  const parsedMsg: ProofRequest = JSON.parse(parsedPayload['@msg'])
  const parsedType: {
    fmt: string,
    name: string,
    ver: string,
  } =
    parsedPayload['@type']
  stringifiableProofRequest.data.proof_request = {
    ...parsedMsg,
    msg_ref_id: uid,
  }
  stringifiableProofRequest.version = parsedType.ver

  return JSON.stringify(stringifiableProofRequest)
}

export function* handleMessage(message: DownloadedMessage): Generator<*, *, *> {
  const { senderDID, uid, type } = message
  const remotePairwiseDID = senderDID
  const connection: Connection[] = yield select(getConnection, senderDID)
  const {
    identifier: forDID,
    vcxSerializedConnection,
    logoUrl: senderLogoUrl,
    senderName,
  }: Connection = connection[0]
  const connectionHandle = yield call(
    getHandleBySerializedConnection,
    vcxSerializedConnection
  )
  try {
    let additionalData:
      | ClaimOfferMessagePayload
      | ProofRequestPushPayload
      | ClaimPushPayload
      | ClaimPushPayloadVcx
      | null = null
    if (type === MESSAGE_TYPE.CLAIM_OFFER) {
      const { decryptedPayload } = message
      // convert message decrypted payload to claim serialized claimOffer
      if (decryptedPayload) {
        // TODO:KS It should not be with serialized claim offer
        // we should be calling createCredentialWithOffer
        // and vcx should take care of converting to it's own internal format
        // connect.me should not change any of these offer to vcx's state
        const convertedSerializedClaimOffer = convertToSerializedClaimOffer(
          decryptedPayload,
          uid
        )

        const vcxSerializedClaimOffer: SerializedClaimOffer | null = yield select(
          getSerializedClaimOffer,
          forDID,
          uid
        )
        if (!vcxSerializedClaimOffer) {
          additionalData = convertSerializedCredentialOfferToAditionalData(
            convertedSerializedClaimOffer,
            senderName,
            senderDID
          )
          const claimHandle: number = yield call(
            getClaimHandleBySerializedClaimOffer,
            convertedSerializedClaimOffer
          )
          yield fork(saveSerializedClaimOffer, claimHandle, forDID, uid)
        }
      }
    }

    if (type === MESSAGE_TYPE.CLAIM) {
      const { decryptedPayload } = message
      additionalData = {
        connectionHandle,
        decryptedPayload,
      }
    }

    if (type === MESSAGE_TYPE.PROOF_REQUEST) {
      const { decryptedPayload } = message
      if (!decryptedPayload) return
      const serializedProof = convertDecryptedPayloadToSerializedProofRequest(
        decryptedPayload,
        uid
      )
      const proofHandle = yield call(proofDeserialize, serializedProof)
      additionalData = convertDecryptedPayloadToAdditionalPayload(
        decryptedPayload,
        uid,
        senderName,
        proofHandle
      )
    }

    if (!additionalData) {
      // we did not get any data or either push notification type is not supported
      return
    }

    yield* updatePayloadToRelevantStoreSaga({
      type,
      additionalData: {
        remoteName: senderName,
        ...additionalData,
      },
      uid,
      senderLogoUrl,
      remotePairwiseDID,
      forDID,
    })
  } catch (e) {
    captureError(e)
    yield put(
      fetchAdditionalDataError({
        code: 'OCS-000',
        message: 'Invalid additional data',
      })
    )
  }
}

// TODO: change the data type from any to proper type
export function* acknowledgeServer(
  data: Array<DownloadedConnectionMessages>
): Generator<*, *, *> {
  const msgTypes = [MESSAGE_TYPE.PROOF_REQUEST]
  let acknowledgeServerData: AcknowledgeServerData = []
  let tempData = data
  if (Array.isArray(tempData) && tempData.length > 0) {
    tempData.map(msgData => {
      let pairwiseDID = msgData.pairwiseDID
      let uids = []
      if (msgData['msgs'] && Array.isArray(msgData['msgs'])) {
        msgData['msgs'].map(msg => {
          if (
            msg.statusCode === MESSAGE_RESPONSE_CODE.MESSAGE_PENDING &&
            msgTypes.indexOf(msg.type) >= 0
          ) {
            uids.push(msg.uid)
          }
        })
      }
      if (uids.length > 0)
        acknowledgeServerData.push({
          pairwiseDID,
          uids,
        })
    })
    if (acknowledgeServerData.length > 0)
      yield updateMessageStatus(acknowledgeServerData)
  }
}

export function* updateMessageStatus(
  acknowledgeServerData: AcknowledgeServerData
): Generator<*, *, *> {
  if (!Array.isArray(acknowledgeServerData)) {
    yield put(acknowledgeMessagesFail('Empty Array'))
    return
  }
  try {
    yield call(updateMessages, 'MS-106', JSON.stringify(acknowledgeServerData))
  } catch (e) {
    captureError(e)
    yield put(
      acknowledgeMessagesFail(`failed at updateMessages api, ${e.message}`)
    )
  }
}

export function* watchOnHydrationDownloadMessages(): any {
  yield takeLatest(VCX_INIT_SUCCESS, getMessagesSaga)
}

export function* watchGetMessagesSaga(): any {
  yield takeLatest(GET_UN_ACKNOWLEDGED_MESSAGES, getMessagesSaga)
}

export const getUnacknowledgedMessages = (): GetUnacknowledgedMessagesAction => ({
  type: GET_UN_ACKNOWLEDGED_MESSAGES,
})
export const getMessagesLoading = (): GetMessagesLoadingAction => ({
  type: GET_MESSAGES_LOADING,
})

export const getMessagesSuccess = (): GetMessagesSuccessAction => ({
  type: GET_MESSAGES_SUCCESS,
})

export const acknowledgeMessages = (): AcknowledgeMessagesAction => ({
  type: ACKNOWLEDGE_MESSAGES,
})

export const getMessagesFail = (): GetMessagesFailAction => ({
  type: GET_MESSAGES_FAIL,
})

export const acknowledgeMessagesFail = (
  message: string
): AcknowledgeMessagesFailAction => ({
  type: ACKNOWLEDGE_MESSAGES_FAIL,
  error: message,
})

export function* watchConfig(): any {
  yield all([
    watchSwitchErrorAlerts(),
    watchSwitchEnvironment(),
    watchChangeEnvironmentUrl(),
    watchVcxInitStart(),
    watchOnHydrationDownloadMessages(),
  ])
}

export const getEnvironmentName = (configStore: ConfigStore) => {
  const { agencyUrl } = configStore

  return findKey(baseUrls, environment => environment.agencyUrl === agencyUrl)
}

export default function configReducer(
  state: ConfigStore = initialState,
  action: ConfigAction
) {
  switch (action.type) {
    case SERVER_ENVIRONMENT_CHANGED:
      const urls = baseUrls[action.serverEnvironment]
      return {
        ...state,
        ...urls,
      }
    case ALREADY_INSTALLED_RESULT:
      return {
        ...state,
        isAlreadyInstalled: action.isAlreadyInstalled,
      }
    case HYDRATED:
      return {
        ...state,
        isHydrated: true,
      }
    case INITIALIZED:
      return {
        ...state,
        isInitialized: true,
      }
    case APP_INSTALLED:
      return {
        ...state,
        isAlreadyInstalled: true,
      }
    case TOGGLE_ERROR_ALERTS:
      return {
        ...state,
        showErrorAlerts: action.isShowErrorAlert,
      }
    case SWITCH_ENVIRONMENT:
      return {
        ...state,
        poolConfig: action.poolConfig,
        agencyDID: action.agencyDID,
        agencyVerificationKey: action.agencyVerificationKey,
        agencyUrl: action.agencyUrl,
      }
    case VCX_INIT_NOT_STARTED:
      return {
        ...state,
        vcxInitializationState: VCX_INIT_NOT_STARTED,
        vcxInitializationError: null,
      }
    case VCX_INIT_START:
      return {
        ...state,
        vcxInitializationState: VCX_INIT_START,
        vcxInitializationError: null,
      }
    case VCX_INIT_SUCCESS:
      return {
        ...state,
        vcxInitializationState: VCX_INIT_SUCCESS,
      }
    case VCX_INIT_FAIL:
      return {
        ...state,
        vcxInitializationState: VCX_INIT_FAIL,
        vcxInitializationError: action.error,
      }
    default:
      return state
  }
}
