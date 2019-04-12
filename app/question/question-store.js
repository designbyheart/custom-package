// @flow

import moment from 'moment'

import type {
  QuestionPayload,
  QuestionReceivedAction,
  QuestionStore,
  QuestionAction,
  SendAnswerToQuestionAction,
  QuestionStatus,
  QuestionResponse,
  QuestionStoreData,
  UpdateQuestionStorageStatusAction,
} from './type-question'
import type { Store } from '../store/type-store'
import type { Connection } from '../store/type-connection-store'
import type { CustomError, StorageStatus } from '../common/type-common'
import type { SignDataResponse } from '../bridge/react-native-cxs/type-cxs'

import {
  QUESTION_RECEIVED,
  SEND_ANSWER_TO_QUESTION,
  QUESTION_STATUS,
  UPDATE_QUESTION_STATUS,
  UPDATE_QUESTION_ANSWER,
  ERROR_GET_CONNECTION_HANDLE,
  ERROR_SIGN_DATA,
  QUESTION_ANSWER_PROTOCOL1,
  ERROR_QUESTION_ANSWER_SEND,
  MESSAGE_TYPE_ANSWER,
  MESSAGE_TITLE_ANSWER,
  HYDRATE_QUESTION_STORE,
  UPDATE_QUESTION_STORAGE_STATUS,
  QUESTION_STORAGE_KEY,
} from './type-question'
import {
  put,
  takeLatest,
  call,
  all,
  select,
  takeEvery,
  fork,
  take,
} from 'redux-saga/effects'
import {
  RESET,
  ERROR_VCX_INIT_FAIL,
  STORAGE_STATUS,
} from '../common/type-common'
import { ensureVcxInitSuccess } from '../store/route-store'
import { VCX_INIT_SUCCESS } from '../store/type-config-store'
import { getConnection } from '../store/store-selector'
import {
  getHandleBySerializedConnection,
  connectionSignData,
  connectionSendMessage,
} from '../bridge/react-native-cxs/RNCxs'
import {
  secureSet,
  safeSet,
  safeGet,
  safeDelete,
  getHydrationItem,
} from '../services/storage'

export function* watchQuestion(): any {
  yield all([watchAnswerToQuestion(), watchQuestionReceived()])
}

function* watchAnswerToQuestion(): any {
  yield takeLatest(SEND_ANSWER_TO_QUESTION, answerToQuestionSaga)
}

export function* watchQuestionReceived(): any {
  yield takeLatest(QUESTION_RECEIVED, persistQuestionSaga)
}

export function* answerToQuestionSaga(
  action: SendAnswerToQuestionAction
): Generator<*, *, *> {
  const { answer, uid } = action
  yield put(updateQuestionStatus(uid, QUESTION_STATUS.SEND_ANSWER_IN_PROGRESS))

  const vcxResult = yield* ensureVcxInitSuccess()
  if (vcxResult && vcxResult.fail) {
    yield put(
      updateQuestionStatus(
        uid,
        QUESTION_STATUS.SEND_ANSWER_FAIL_TILL_CLOUD_AGENT,
        ERROR_VCX_INIT_FAIL()
      )
    )
  }

  try {
    const question: QuestionPayload = yield select(selectQuestion, uid)
    const [connection]: Connection[] = yield select(
      getConnection,
      question.from_did
    )
    const connectionHandle: number = yield call(
      getHandleBySerializedConnection,
      connection.vcxSerializedConnection
    )
    try {
      const { data, signature }: SignDataResponse = yield call(
        connectionSignData,
        connectionHandle,
        answer.nonce
      )
      try {
        const userAnswer = getUserAnswer({ data, signature })
        const answerMsgId: string = yield call(
          connectionSendMessage,
          connectionHandle,
          JSON.stringify(userAnswer),
          MESSAGE_TYPE_ANSWER,
          MESSAGE_TITLE_ANSWER
        )
        yield put(
          updateQuestionStatus(
            uid,
            QUESTION_STATUS.SEND_ANSWER_SUCCESS_TILL_CLOUD_AGENT
          )
        )
        yield put(updateQuestionAnswer(uid, answer, answerMsgId))
        // since answer is complete, we need to persist new state
        yield call(persistQuestionSaga)
      } catch (e) {
        yield put(
          updateQuestionStatus(
            uid,
            QUESTION_STATUS.SEND_ANSWER_FAIL_TILL_CLOUD_AGENT,
            ERROR_QUESTION_ANSWER_SEND(e.message)
          )
        )
      }
    } catch (e) {
      yield put(
        updateQuestionStatus(
          uid,
          QUESTION_STATUS.SEND_ANSWER_FAIL_TILL_CLOUD_AGENT,
          ERROR_SIGN_DATA(e.message)
        )
      )
    }
  } catch (e) {
    yield put(
      updateQuestionStatus(
        uid,
        QUESTION_STATUS.SEND_ANSWER_FAIL_TILL_CLOUD_AGENT,
        ERROR_GET_CONNECTION_HANDLE(e.message)
      )
    )
  }
}

export function* persistQuestionSaga(
  action: ?QuestionReceivedAction
): Generator<*, *, *> {
  try {
    const storageStatus: StorageStatus = yield select(
      selectQuestionStorageStatus
    )
    if (storageStatus === STORAGE_STATUS.RESTORE_START) {
      yield take(isQuestionRestoreConcluded)
    }
    yield put(updateQuestionStorageStatus(STORAGE_STATUS.PERSIST_START))
    // once we know that now there is nothing new being restored
    // we can take state from redux store as current state
    const questionState: QuestionStoreData = yield select(
      selectQuestionStoreData
    )
    yield call(secureSet, QUESTION_STORAGE_KEY, JSON.stringify(questionState))
    yield put(updateQuestionStorageStatus(STORAGE_STATUS.PERSIST_SUCCESS))
  } catch (e) {
    yield put(updateQuestionStorageStatus(STORAGE_STATUS.PERSIST_FAIL))
  }
}

export function* hydrateQuestionSaga(): Generator<*, *, *> {
  try {
    yield put(updateQuestionStorageStatus(STORAGE_STATUS.RESTORE_START))
    const data: string = yield call(getHydrationItem, QUESTION_STORAGE_KEY)
    if (data) {
      yield put(hydrateQuestionStore(JSON.parse(data)))
    }
    yield put(updateQuestionStorageStatus(STORAGE_STATUS.RESTORE_SUCCESS))
  } catch (e) {
    yield put(updateQuestionStorageStatus(STORAGE_STATUS.RESTORE_FAIL))
  }
}

export function getUserAnswer({ data, signature }: SignDataResponse) {
  return {
    '@type': QUESTION_ANSWER_PROTOCOL1,
    'response.@sig': {
      signature,
      sig_data: data,
      timestamp: moment().format(),
    },
  }
}

export const questionReceived = (
  question: QuestionPayload
): QuestionReceivedAction => ({
  type: QUESTION_RECEIVED,
  question,
})

export const sendAnswerToQuestion = (
  uid: string,
  answer: QuestionResponse
) => ({
  type: SEND_ANSWER_TO_QUESTION,
  uid,
  answer,
})

export const updateQuestionStatus = (
  uid: string,
  status: QuestionStatus,
  error: ?CustomError
) => ({
  type: UPDATE_QUESTION_STATUS,
  uid,
  status,
  error,
})

export const updateQuestionAnswer = (
  uid: string,
  answer: QuestionResponse,
  answerMsgId: string
) => ({
  type: UPDATE_QUESTION_ANSWER,
  uid,
  answer,
  answerMsgId,
})

export const updateQuestionStorageStatus = (status: StorageStatus) => ({
  type: UPDATE_QUESTION_STORAGE_STATUS,
  status,
})

export const hydrateQuestionStore = (data: QuestionStoreData) => ({
  type: HYDRATE_QUESTION_STORE,
  data,
})

const questionRestoreConcludedStates = [
  STORAGE_STATUS.RESTORE_SUCCESS,
  STORAGE_STATUS.RESTORE_FAIL,
]
// action is typed any because action can be of any type
// since redux-saga passes every action through to check if it matches
function isQuestionRestoreConcluded(action: any): boolean {
  // we wait question restore to conclude
  // by checking whether restore either failed or success
  return (
    action.type === UPDATE_QUESTION_STORAGE_STATUS &&
    questionRestoreConcludedStates.indexOf(action.status) > -1
  )
}

const initialState = {
  data: {},
  storageStatus: STORAGE_STATUS.IDLE,
}

export function selectQuestion(state: Store, uid: string) {
  return state.question.data[uid].payload
}

export function selectQuestionStorageStatus(state: Store) {
  return state.question.storageStatus
}

export function selectQuestionStoreData(state: Store) {
  return state.question.data
}

export default function questionReducer(
  state: QuestionStore = initialState,
  action: QuestionAction
) {
  switch (action.type) {
    case QUESTION_RECEIVED:
      return {
        ...state,
        data: {
          ...state.data,
          [action.question.uid]: {
            payload: action.question,
            status: QUESTION_STATUS.RECEIVED,
            error: null,
            answer: null,
            answerMsgId: null,
          },
        },
      }

    case UPDATE_QUESTION_STATUS:
      return {
        ...state,
        data: {
          ...state.data,
          [action.uid]: {
            ...state.data[action.uid],
            status: action.status,
            error: action.error || null,
          },
        },
      }

    case UPDATE_QUESTION_ANSWER:
      return {
        ...state,
        data: {
          ...state.data,
          [action.uid]: {
            ...state.data[action.uid],
            answer: action.answer,
            answerMsgId: action.answerMsgId,
          },
        },
      }

    case UPDATE_QUESTION_STORAGE_STATUS:
      return {
        ...state,
        storageStatus: action.status,
      }

    case HYDRATE_QUESTION_STORE:
      return {
        ...state,
        data: {
          ...state.data,
          ...action.data,
        },
        storageStatus: STORAGE_STATUS.RESTORE_SUCCESS,
      }

    case RESET:
      return initialState

    default:
      return state
  }
}
