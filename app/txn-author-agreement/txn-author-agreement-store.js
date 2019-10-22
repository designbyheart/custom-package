// @flow
import { takeLatest, put, all, take, call, select } from 'redux-saga/effects'
import {
  CHECK_TXN_AUTHOR_AGREEMENT,
  TAA_ACCEPTED,
  TAA_RECEIVED,
  TAA_ACCEPT_SUBMIT,
  UPDATE_TAA_STATUS,
  TAA_STATUS,
  HYDRATE_TAA_ACCEPTED_VERSION,
} from './type-txn-author-agreement'
import type {
  QuestionStatus,
  QuestionResponse,
} from '../question/type-question'
import type {
  TxnAuthorAgreementAction,
  TxnAuthorAgreementStore,
  CheckTxnAuthorAgreementAction,
  SubmitTxnAuthorAgreementAction,
  TAAResponse,
  TAAPayload,
} from './type-txn-author-agreement'
import { questionReceived } from '../question/question-store'
import { navigateToRoutePN } from '../push-notification/push-notification-store'
import {
  txnAuthorAgreementRoute,
  questionRoute,
} from '../common/route-constants'
import { UPDATE_QUESTION_STORAGE_STATUS } from '../question/type-question'
import { STORAGE_STATUS } from '../common/type-common'
import type { CustomError } from '../common/type-common'

import {
  getTxnAuthorAgreement,
  getAcceptanceMechanisms,
  setActiveTxnAuthorAgreementMeta,
  appendTxnAuthorAgreement,
} from '../bridge/react-native-cxs/RNCxs'
import { TAA_HASH, TAA_ACCEPTED_VERSION } from '../common'
import { secureSet, getHydrationItem } from '../services/storage'
import {
  getTaaAcceptedVersion,
  getUserOneTimeInfo,
  getAllTxnAuthorAgreement,
} from '../store/store-selector'
import {
  isValidTAAResponse,
  convertVcxTAAToCxsClaimTAA,
} from './txn-author-agreement-validator'
import { flattenAsync } from '../common/flatten-async'
import { captureError } from '../services/error/error-handler'

const initialState = {
  haveAlreadySignedAgreement: false,
  thereIsANewAgreement: false,
  status: TAA_STATUS.IDLE,
  version: '',
  taaAcceptedVersion: '',
  text: '',
  aml: '',
}

export const sendAnswerToQuestion = (
  uid?: string,
  answer: QuestionResponse
) => ({
  type: TAA_ACCEPTED,
  uid,
  answer,
})

export const taaAcceptSubmit = () => ({
  type: TAA_ACCEPT_SUBMIT,
})

export const taaAccepted = (
  taaAcceptedVersion: string
  // timeAccepted: number,
  // hash: string
) => ({
  type: TAA_ACCEPTED,
  taaAcceptedVersion,
  // timeAccepted,
  // hash
})

export const updateQuestionStatus = (
  uid: string,
  status: QuestionStatus,
  error: ?CustomError
) => ({
  type: 'TAA_UPDATE_QUESTION_STATUS',
  uid,
  status,
  error,
})

export const checkTxnAuthorAgreement = () => ({
  type: CHECK_TXN_AUTHOR_AGREEMENT,
})

export function* watchTxnAuthorAgreement(): any {
  yield all([watchCheckTxnAuthorAgreement(), watchTaaAcceptSubmit()])
}

function* watchCheckTxnAuthorAgreement(): any {
  yield takeLatest(CHECK_TXN_AUTHOR_AGREEMENT, checkTxnAuthorAgreementSaga)
}
function* watchTaaAcceptSubmit(): any {
  yield takeLatest(TAA_ACCEPT_SUBMIT, submitTxnAuthorAgreementSaga)
}

export const taaReceived = (
  text: string,
  version: string,
  aml: Object
): any => ({
  type: TAA_RECEIVED,
  text,
  version,
  aml,
})

export const updateStatus = (status: string): any => ({
  type: UPDATE_TAA_STATUS,
  status,
})

export function* hydrateTxnAuthorAgreementSaga(): Generator<*, *, *> {
  try {
    const fetchedTaaAcceptedVersion = yield call(
      getHydrationItem,
      TAA_ACCEPTED_VERSION
    )
    if (fetchedTaaAcceptedVersion) {
      // if there is a version we need to check if it is the current version on the ledger here?
      const taaAcceptedVersion: string = fetchedTaaAcceptedVersion
      yield put(hydrateTxnAuthorAgreement(taaAcceptedVersion))
    }
  } catch (e) {
    captureError(e)
  }
}

export const hydrateTxnAuthorAgreement = (taaAcceptedVersion: string) => ({
  type: HYDRATE_TAA_ACCEPTED_VERSION,
  taaAcceptedVersion,
})

export function* checkTxnAuthorAgreementSaga(
  action: ?CheckTxnAuthorAgreementAction
): Generator<*, *, *> {
  yield put(updateStatus(TAA_STATUS.GET_TAA_IN_PROGRESS))

  try {
    // need to get type of the getTxnAuthorAgreement response
    //  let taaResponse:string = yield call(getTxnAuthorAgreement)
    const [getTxnAuthorAgreementError, taaResponse]: [
      typeof Error,
      string,
    ] = yield call(flattenAsync(getTxnAuthorAgreement))
    if (getTxnAuthorAgreementError) {
      yield put(updateStatus(TAA_STATUS.GET_TAA_ERROR))
      return
    }

    const taaData: TAAResponse | boolean = isValidTAAResponse(taaResponse)
    if (!taaData || typeof taaData !== 'object') {
      yield put(updateStatus(TAA_STATUS.GET_TAA_ERROR))
      return
    }
    const convertedTAAData: TAAPayload = convertVcxTAAToCxsClaimTAA(taaData)
    let { text, version, aml } = convertedTAAData

    const currentUserTaaVersion = yield select(getTaaAcceptedVersion)
    // NOTE: need to get taa to see if version has changed.
    if (currentUserTaaVersion === version) {
      yield put(taaAccepted(version))
      yield put(updateStatus(TAA_STATUS.ACCEPT_TAA_SUCCESS))
      return
    }

    yield put(updateStatus(TAA_STATUS.GET_TAA_SUCCESS))
    yield put(taaReceived(text, version, aml))
  } catch (e) {
    yield put(updateStatus(TAA_STATUS.ACCEPT_TAA_ERROR))
  }
}

export function* submitTxnAuthorAgreementSaga(
  action: ?SubmitTxnAuthorAgreementAction
): Generator<*, *, *> {
  yield put(updateStatus(TAA_STATUS.ACCEPT_TAA_IN_PROGRESS))
  try {
    const timeAccepted = Date.now()
    const userOneTimeInfo = yield select(getUserOneTimeInfo)
    const userDID = userOneTimeInfo.myOneTimeDid

    const txnAuthorAgreement = yield select(getAllTxnAuthorAgreement)
    const { version, aml, text } = txnAuthorAgreement

    const taaRequest: string = yield call(
      getAcceptanceMechanisms,
      userDID,
      -1, // Note: -1 to get most recent mechanism
      version
    )
    const appendTxnAuthorAgreementRes: string = yield call(
      appendTxnAuthorAgreement,
      taaRequest,
      text,
      version,
      undefined, // Note: taa digest undefined is generated by hashing text and version
      aml.wallet_agreement,
      timeAccepted
    )
    yield put(taaAccepted(version))
    yield put(updateStatus(TAA_STATUS.ACCEPT_TAA_SUCCESS))
    yield call(secureSet, TAA_ACCEPTED_VERSION, version)
  } catch (e) {
    yield put(updateStatus(TAA_STATUS.ACCEPT_TAA_ERROR))
  }
}

export default function txnAuthorAgreementReducer(
  state: TxnAuthorAgreementStore = initialState,
  action: TxnAuthorAgreementAction
) {
  switch (action.type) {
    case TAA_ACCEPTED:
      return {
        ...state,
        haveAlreadySignedAgreement: true,
        taaAcceptedVersion: action.taaAcceptedVersion,
      }
    case TAA_RECEIVED:
      return {
        ...state,
        text: action.text,
        version: action.version,
        aml: action.aml,
      }
    case UPDATE_TAA_STATUS:
      return {
        ...state,
        status: action.status,
      }
    case HYDRATE_TAA_ACCEPTED_VERSION:
      return {
        ...state,
        taaAcceptedVersion: action.taaAcceptedVersion,
      }
    default:
      return state
  }
}
