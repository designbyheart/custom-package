// @flow

import {
  QUESTION_ANSWER_PROTOCOL1,
  QUESTION_STATUS,
} from '../../app/question/type-question'
import { STORAGE_STATUS } from '../../app/common/type-common'

export const mockQuestionPayload = {
  messageTitle: 'Message Title',
  messageText: 'Message Text',
  '@type': QUESTION_ANSWER_PROTOCOL1,
  messageId: 'MSG-ID',
  question_text: 'Question Text',
  question_detail: 'Question Detail',
  valid_responses: [
    { text: 'Answer 1', nonce: 'akdfakjfkjdaadkgak' },
    { text: 'Answer 2', nonce: 'hyjjjjuifhjkiutyojoh' },
  ],
  timing: { expires_time: '2017-06-01:05:07:07' },
  issuer_did: 'issuerDid',
  remoteDid: 'remoteDid',
  uid: '001',
  from_did: 'senderDid',
  forDID: 'myPairwiseDid',
}

export const mockQuestionReceivedState = {
  data: {
    [mockQuestionPayload.uid]: {
      payload: mockQuestionPayload,
      status: QUESTION_STATUS.RECEIVED,
      answer: null,
      answerMsgId: null,
      error: null,
    },
  },
  storageStatus: STORAGE_STATUS.RESTORE_SUCCESS,
}
