// @flow

export const QUESTION_RECEIVED = 'QUESTION_RECEIVED'
export type QuestionReceivedAction = {
  type: typeof QUESTION_RECEIVED,
  question: Question,
}

export type QuestionResponse = {
  text: string,
  nonce: string,
}

export type Question = {
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
  connectionHandle?: any,
  remotePairwiseDID?: string,
}

export type QuestionRequest = {
  '@type': string,
  '@id': string,
  question_text: string,
  question_detail: string,
  valid_responses: Array<QuestionResponse>,
  '@timing': { expires_time: string },
}
