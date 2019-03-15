// @flow

import type {
  QuestionPayload,
  QuestionReceivedAction,
  QuestionStore,
  QuestionAction,
} from './type-question'
import { QUESTION_RECEIVED } from './type-question'
import {
  put,
  takeLatest,
  call,
  all,
  select,
  takeEvery,
  fork,
} from 'redux-saga/effects'
import { RESET } from '../common/type-common'

export const questionReceived = (
  question: QuestionPayload
): QuestionReceivedAction => ({
  type: QUESTION_RECEIVED,
  question,
})

// export function* watchQuestionReceived(): any {
//   yield takeEvery(QUESTION_RECEIVED, questionReceivedSaga)
// }

export function* watchQuestion(): any {
  //yield all([watchQuestionReceived()])
}

// export function* questionReceivedSaga(
//   action: QuestionReceivedAction
// ): Generator<*, *, *> {
//   console.log('questionReceivedSaga action: ', action)
// }

const initialState = {
  question: undefined,
}

export default function questionReducer(
  state: QuestionStore = initialState,
  action: QuestionAction
) {
  switch (action.type) {
    case QUESTION_RECEIVED:
      return {
        ...state,
      }

    case RESET:
      return initialState

    default:
      return state
  }
}
