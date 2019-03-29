// @flow
import type {
  ReactNavigation,
  CustomError,
  InitialTestAction,
  StorageStatus,
} from '../common/type-common'

export type QuestionProps = {} & ReactNavigation

export const QUESTION_RECEIVED = 'QUESTION_RECEIVED'
export type QuestionReceivedAction = {
  type: typeof QUESTION_RECEIVED,
  question: QuestionPayload,
}

export const SEND_ANSWER_TO_QUESTION = 'SEND_ANSWER_TO_QUESTION'
export type SendAnswerToQuestionAction = {
  type: typeof SEND_ANSWER_TO_QUESTION,
  uid: string,
  answer: QuestionResponse,
}

export const UPDATE_QUESTION_STATUS = 'UPDATE_QUESTION_STATUS'
export type UpdateQuestionStatusAction = {
  type: typeof UPDATE_QUESTION_STATUS,
  uid: string,
  status: QuestionStatus,
  error: ?CustomError,
}

export const UPDATE_QUESTION_ANSWER = 'UPDATE_QUESTION_ANSWER'
export type UpdateQuestionAnswerAction = {
  type: typeof UPDATE_QUESTION_ANSWER,
  uid: string,
  answer: QuestionResponse,
  answerMsgId: string,
}

export const UPDATE_QUESTION_STORAGE_STATUS = 'UPDATE_QUESTION_STORAGE_STATUS'
export type UpdateQuestionStorageStatusAction = {
  type: typeof UPDATE_QUESTION_STORAGE_STATUS,
  status: StorageStatus,
}

export const HYDRATE_QUESTION_STORE = 'HYDRATE_QUESTION_STORE'
export type HydrateQuestionStoreAction = {
  type: typeof HYDRATE_QUESTION_STORE,
  data: QuestionStoreData,
}

export type QuestionResponse = {
  text: string,
  nonce: string,
}

// TODO: Convert property names as per JS standard for naming without underscores
export type QuestionPayload = {
  messageTitle: string,
  messageText: string,
  '@type': string,
  messageId: string,
  question_text: string,
  question_detail: string,
  valid_responses: Array<QuestionResponse>,
  timing: { expires_time: string },
  issuer_did: string,
  remoteDid: string,
  uid: string,
  from_did: string,
  forDID: string,
  remotePairwiseDID: string,
}

export type QuestionRequest = {
  '@type': string,
  '@id': string,
  question_text: string,
  question_detail: string,
  valid_responses: Array<QuestionResponse>,
  '@timing': { expires_time: string },
}

export const QUESTION_STATUS = {
  RECEIVED: 'RECEIVED',
  SEEN: 'SEEN',
  SEND_ANSWER_IN_PROGRESS: 'SEND_ANSWER_IN_PROGRESS',
  // we have different statuses for sending failure
  // because in our app we might successfully deliver a message till cloud agent
  // but we might receive an error while cloud agent forwards our message
  // to intended recipient, so we specify success and failure
  // separately for cloud agent and end-to-end
  // These statues might also be used for showing different UI in case of
  // cloud agent success and with different UI in case of end-to-end success
  SEND_ANSWER_FAIL_TILL_CLOUD_AGENT: 'SEND_ANSWER_FAIL_TILL_CLOUD_AGENT',
  SEND_ANSWER_FAIL_END_TO_END: 'SEND_ANSWER_FAIL_END_TO_END',
  SEND_ANSWER_SUCCESS_TILL_CLOUD_AGENT: 'SEND_ANSWER_SUCCESS_TILL_CLOUD_AGENT',
  SEND_ANSWER_SUCCESS_END_TO_END: 'SEND_ANSWER_SUCCESS_END_TO_END',
}
export type QuestionStatus = $Keys<typeof QUESTION_STATUS>

export type QuestionStoreMessage = {
  payload: QuestionPayload,
  status: QuestionStatus,
  error: ?CustomError,
  // used to keep track of what answer user selected
  // this field should be populated only after send answer is success
  answer: ?QuestionResponse,
  answerMsgId: ?string,
}

export type QuestionStoreData = {
  [msgId: string]: QuestionStoreMessage,
}

export type QuestionStore = {
  data: QuestionStoreData,
  // used to keep track of state of data that we persist to device
  // also to track state of data that we hydrate from device
  // For example: When user runs our app again, we go to secure storage
  // and get the data for each store in our app
  // Meanwhile we might get some more data that is generated by user action
  // say, another question arrived, and our question will be saved in redux-store
  // however, since we persist our question store as soon as there is a new question
  // we might accidentally overwrite already stored data which is in progress of restoring
  // so this flag will help us avoid those accidents
  // also, it would be good to know about restore and persist status
  storageStatus: StorageStatus,
}

export type QuestionAction =
  | QuestionReceivedAction
  | SendAnswerToQuestionAction
  | UpdateQuestionStatusAction
  | UpdateQuestionAnswerAction
  | UpdateQuestionStorageStatusAction
  | HydrateQuestionStoreAction
  | InitialTestAction

export const ERROR_GET_CONNECTION_HANDLE = (message: ?string) => ({
  code: 'CM-QUE-001',
  message: `Failed to get connection handle: ${message || ''}`,
})

export const ERROR_SIGN_DATA = (message: ?string) => ({
  code: 'CM-QUE-002',
  message: `Failed to sign data: ${message || ''}`,
})

export const ERROR_QUESTION_ANSWER_SEND = (message: ?string) => ({
  code: 'CM-QUE-003',
  message: `Failed to send answer: ${message || ''}`,
})

export const QUESTION_ANSWER_PROTOCOL1 =
  'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/committedanswer/1.0/answer'

export const MESSAGE_TYPE_ANSWER = 'Answer'
export const MESSAGE_TITLE_ANSWER = 'Peer Sent Answer'
export const QUESTION_STORAGE_KEY = 'QUESTION_STORAGE_KEY'
