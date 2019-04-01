// @flow

import { put, call, select } from 'redux-saga/effects'
import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'

import questionReducer, {
  answerToQuestionSaga,
  questionReceived,
  sendAnswerToQuestion,
  updateQuestionStatus,
  updateQuestionAnswer,
  getUserAnswer,
  updateQuestionStorageStatus,
  hydrateQuestionStore,
} from '../question-store'
import { initialTestAction, STORAGE_STATUS } from '../../common/type-common'
import {
  mockQuestionPayload,
  mockQuestionReceivedState,
} from '../../../__mocks__/data/question-store-mock-data'
import {
  QUESTION_STATUS,
  ERROR_QUESTION_ANSWER_SEND,
  MESSAGE_TYPE_ANSWER,
  MESSAGE_TITLE_ANSWER,
} from '../type-question'
import { VCX_INIT_SUCCESS } from '../../store/type-config-store'
import {
  pairwiseConnection,
  vcxSerializedConnection,
} from '../../../__mocks__/static-data'
import {
  getHandleBySerializedConnection,
  connectionSignData,
  connectionSendMessage,
} from '../../bridge/react-native-cxs/RNCxs'

describe('Question Store', () => {
  const { uid, valid_responses } = mockQuestionPayload
  const answer = valid_responses[0]
  const answerMsgId = 'answerMsgId'

  let initialState
  beforeEach(() => {
    initialState = questionReducer(undefined, initialTestAction())
  })

  it('action:questionReceived', () => {
    expect(
      questionReducer(initialState, questionReceived(mockQuestionPayload))
    ).toMatchSnapshot()
  })

  it('action:sendAnswerToQuestion', () => {
    const afterQuestionReceivedState = getAfterQuestionReceivedState()
    expect(
      questionReducer(
        afterQuestionReceivedState,
        sendAnswerToQuestion(uid, answer)
      )
    ).toMatchSnapshot()
  })

  it('action:updateQuestionStatus', () => {
    const afterQuestionReceivedState = getAfterQuestionReceivedState()
    expect(
      questionReducer(
        afterQuestionReceivedState,
        updateQuestionStatus(uid, QUESTION_STATUS.SEND_ANSWER_IN_PROGRESS)
      )
    ).toMatchSnapshot()
    expect(
      questionReducer(
        afterQuestionReceivedState,
        updateQuestionStatus(
          uid,
          QUESTION_STATUS.SEND_ANSWER_FAIL_TILL_CLOUD_AGENT,
          ERROR_QUESTION_ANSWER_SEND('HTTP error')
        )
      )
    ).toMatchSnapshot()
  })

  it('action:updateQuestionAnswer', () => {
    expect(
      questionReducer(
        getAfterQuestionReceivedState(),
        updateQuestionAnswer(uid, answer, answerMsgId)
      )
    ).toMatchSnapshot()
  })

  it('action:updateQuestionStorageStatus', () => {
    expect(
      questionReducer(
        getAfterQuestionReceivedState(),
        updateQuestionStorageStatus(STORAGE_STATUS.RESTORE_START)
      )
    ).toMatchSnapshot()
  })

  it('action:hydrateQuestionStore', () => {
    expect(
      questionReducer(
        initialState,
        hydrateQuestionStore(mockQuestionReceivedState.data)
      )
    ).toMatchSnapshot()
    expect(
      questionReducer(
        getAfterQuestionReceivedState(),
        hydrateQuestionStore(mockQuestionReceivedState.data)
      )
    ).toMatchSnapshot()
  })

  it('saga:answerToQuestionSaga', () => {
    const userDID = pairwiseConnection.identifier

    const stateWithConnectionQuestionVcxSuccess = {
      config: {
        vcxInitializationState: VCX_INIT_SUCCESS,
      },
      connections: {
        data: {
          [userDID]: {
            ...pairwiseConnection,
            senderDID: mockQuestionPayload.from_did,
            vcxSerializedConnection: vcxSerializedConnection,
          },
        },
      },
      question: mockQuestionReceivedState,
    }
    const connectionHandle = 1
    const signDataResponse = {
      data: 'dataInBase64',
      signature: 'signatureInBase64GenerateByDataInBase64',
    }

    return expectSaga(answerToQuestionSaga, sendAnswerToQuestion(uid, answer))
      .withState(stateWithConnectionQuestionVcxSuccess)
      .provide([
        [matchers.call.fn(getHandleBySerializedConnection), connectionHandle],
        [matchers.call.fn(connectionSignData), signDataResponse],
        [matchers.call.fn(connectionSendMessage), answerMsgId],
      ])
      .call(getHandleBySerializedConnection, vcxSerializedConnection)
      .call(connectionSignData, connectionHandle, answer.nonce)
      .call(
        connectionSendMessage,
        connectionHandle,
        JSON.stringify(getUserAnswer(signDataResponse)),
        MESSAGE_TYPE_ANSWER,
        MESSAGE_TITLE_ANSWER
      )
      .put(
        updateQuestionStatus(
          uid,
          QUESTION_STATUS.SEND_ANSWER_SUCCESS_TILL_CLOUD_AGENT
        )
      )
      .put(updateQuestionAnswer(uid, answer, answerMsgId))
      .run()
  })
})

function getAfterQuestionReceivedState() {
  return questionReducer(
    questionReducer(undefined, initialTestAction()),
    questionReceived(mockQuestionPayload)
  )
}
