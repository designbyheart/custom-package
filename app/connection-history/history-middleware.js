// @flow
import type { Middleware, MiddlewareAPI, Dispatch } from 'redux'
import { INVITATION_RECEIVED } from '../invitation/type-invitation'
import { NEW_CONNECTION_SUCCESS } from '../store/new-connection-success'
import {
  SEND_CLAIM_REQUEST_SUCCESS,
  CLAIM_OFFER_RECEIVED,
  CLAIM_OFFER_ACCEPTED,
  SEND_CLAIM_REQUEST_FAIL,
  PAID_CREDENTIAL_REQUEST_FAIL,
} from '../claim-offer/type-claim-offer'
import { CLAIM_STORAGE_SUCCESS } from '../claim/type-claim'
import {
  PROOF_REQUEST_RECEIVED,
  SEND_PROOF_SUCCESS,
  DENY_PROOF_REQUEST_SUCCESS,
  DENY_PROOF_REQUEST,
  DENY_PROOF_REQUEST_FAIL,
} from '../proof-request/type-proof-request'
import { RECORD_HISTORY_EVENT } from './type-connection-history'
import { historyEventOccurred } from './connection-history-store'
import {
  QUESTION_RECEIVED,
  UPDATE_QUESTION_ANSWER,
} from '../question/type-question'
import { UPDATE_ATTRIBUTE_CLAIM, ERROR_SEND_PROOF } from '../proof/type-proof'

const actionToRecord = [
  // removing invitation received from record array
  // because anyway we will not show this event in history view
  // also it uses secure set that is only accessible after vcx_init
  // and we don't want to trigger vxc_init just because invitation
  // is downloaded
  // INVITATION_RECEIVED,
  NEW_CONNECTION_SUCCESS,
  PROOF_REQUEST_RECEIVED,
  CLAIM_OFFER_RECEIVED,
  SEND_CLAIM_REQUEST_SUCCESS,
  CLAIM_STORAGE_SUCCESS,
  SEND_PROOF_SUCCESS,
  QUESTION_RECEIVED,
  UPDATE_QUESTION_ANSWER,
  DENY_PROOF_REQUEST,
  DENY_PROOF_REQUEST_FAIL,
  DENY_PROOF_REQUEST_SUCCESS,
  CLAIM_OFFER_ACCEPTED,
  SEND_CLAIM_REQUEST_FAIL,
  PAID_CREDENTIAL_REQUEST_FAIL,
  UPDATE_ATTRIBUTE_CLAIM,
  ERROR_SEND_PROOF,
]

// TODO:KS Fix any type using `redux` provided Generic Types
const history = (store: any) => (next: any) => (action: any) => {
  // pass on the action first to other middleware in line
  const nextState = next(action)

  // now go for our own history recorder
  if (actionToRecord.indexOf(action.type) > -1) {
    // we got an action that needs to be recorded
    // dispatch an action, that starts from beginning of middleware chain
    // we are dispatching a new action here
    store.dispatch(historyEventOccurred(action))
  }

  return nextState
}

export default history
