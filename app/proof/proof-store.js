// @flow

import {
  put,
  take,
  call,
  all,
  select,
  takeEvery,
  race,
} from 'redux-saga/effects'
import type {
  Proof,
  ProofStore,
  UpdateAttributeClaimAction,
  ProofAction,
  GenerateProofAction,
  ProofSuccessAction,
  ProofFailAction,
  IndyPreparedProof,
  IndyRequestedAttributes,
  IndySelfAttestedAttributes,
  UserSelfAttestedAttributesAction,
  IndyRequestedProof,
  RequestedClaimsJson,
  VcxSelectedCredentials,
  RetrySendProofAction,
} from './type-proof'
import type {
  ProofRequestData,
  SelfAttestedAttributes,
  MissingAttribute,
  IndySelfAttested,
  SelfAttestedAttribute,
  ProofRequestedAttributes,
  ProofRequestPayload,
  DissatisfiedAttribute,
} from '../proof-request/type-proof-request'
import {
  UPDATE_ATTRIBUTE_CLAIM,
  GENERATE_PROOF,
  PROOF_SUCCESS,
  PROOF_FAIL,
  ERROR_MISSING_ATTRIBUTE_IN_CLAIMS,
  USER_SELF_ATTESTED_ATTRIBUTES,
  PROOF_REQUEST_SEND_PROOF_HANDLE,
  RESET_TEMP_PROOF_DATA,
  ERROR_SEND_PROOF,
  CLEAR_ERROR_SEND_PROOF,
  RETRY_SEND_PROOF,
} from './type-proof'
import type { CustomError, RequestedAttrsJson } from '../common/type-common'
import type { ClaimMap } from '../claim/type-claim'
import {
  generateProof,
  getMatchingCredentials,
  proofDeserialize,
  proofCreateWithRequest,
} from '../bridge/react-native-cxs/RNCxs'
import {
  proofRequestAutoFill,
  missingAttributesFound,
  acceptProofRequest,
  sendProof,
  updateProofHandle,
  dissatisfiedAttributesFound,
} from '../proof-request/proof-request-store'
import {
  getOriginalProofRequestData,
  getProofRequestPairwiseDid,
  getPoolConfig,
  getProofRequesterName,
  getProofRequest,
  getProofData,
  getClaimMap,
} from '../store/store-selector'
import type { Attribute } from '../push-notification/type-push-notification'
import { RESET } from '../common/type-common'
import {
  PROOF_REQUEST_SHOW_START,
  NO_SELF_ATTEST,
  MISSING_ATTRIBUTES_FOUND,
  PROOF_REQUEST_AUTO_FILL,
} from '../proof-request/type-proof-request'
import { captureError } from '../services/error/error-handler'
// import KeepScreenOn from 'react-native-keep-screen-on'
import { customLogger } from '../store/custom-logger'

export const updateAttributeClaim = (
  uid: string,
  remoteDid: string,
  requestedAttrsJson: RequestedAttrsJson
): UpdateAttributeClaimAction => ({
  type: UPDATE_ATTRIBUTE_CLAIM,
  uid,
  remoteDid,
  requestedAttrsJson,
})

export const getProof = (uid: string) => ({
  type: GENERATE_PROOF,
  uid,
})

export const proofSuccess = (
  proof: Proof,
  uid: string
): ProofSuccessAction => ({
  type: PROOF_SUCCESS,
  proof,
  uid,
})

export const proofFail = (
  uid: string,
  error: CustomError
): ProofFailAction => ({
  type: PROOF_FAIL,
  uid,
  error,
})

export const userSelfAttestedAttributes = (
  selfAttestedAttributes: SelfAttestedAttributes,
  uid: string
) => ({
  type: USER_SELF_ATTESTED_ATTRIBUTES,
  selfAttestedAttributes,
  uid,
})

export const proofRequestDataToStore = (
  uid: string,
  proofHandle: number,
  selfAttestedAttributes: SelfAttestedAttributes
) => ({
  type: PROOF_REQUEST_SEND_PROOF_HANDLE,
  uid,
  proofHandle,
  selfAttestedAttributes,
})

export const resetTempProofData = (uid: string) => ({
  type: RESET_TEMP_PROOF_DATA,
  uid,
})

export const errorSendProofFail = (
  uid: string,
  remoteDid: string,
  error: CustomError
) => ({
  type: ERROR_SEND_PROOF,
  uid,
  remoteDid,
  error,
})

export const clearSendProofFail = (uid: string) => ({
  type: CLEAR_ERROR_SEND_PROOF,
  uid,
})

export function convertSelfAttestedToIndySelfAttested(
  selfAttestedAttributes: SelfAttestedAttributes
): IndySelfAttested {
  return Object.keys(selfAttestedAttributes).reduce((acc, name) => {
    const { key, data }: SelfAttestedAttribute = selfAttestedAttributes[name]
    return {
      ...acc,
      [key]: data,
    }
  }, {})
}

export function convertPreparedProofToRequestedAttributes(
  preparedProof: IndyPreparedProof,
  proofRequest: ProofRequestData
): [IndyRequestedAttributes, MissingAttribute[], DissatisfiedAttribute[]] {
  // apart from conversion, it finds attributes that are not in any claim

  const missingAttributes: MissingAttribute[] = []
  const dissatisfiedAttributes: DissatisfiedAttribute[] = []
  const requestedAttributes = Object.keys(
    proofRequest.requested_attributes
  ).reduce((acc, attrKey) => {
    const attributeClaimData = preparedProof.attrs[attrKey]

    if (!attributeClaimData || !attributeClaimData[0]) {
      const requestedAttribute = proofRequest.requested_attributes[attrKey]
      if (
        typeof requestedAttribute.self_attest_allowed === 'boolean' &&
        requestedAttribute.self_attest_allowed === false
      ) {
        dissatisfiedAttributes.push({
          name: requestedAttribute.name,
          reason: NO_SELF_ATTEST,
        })
      } else {
        missingAttributes.push({
          key: attrKey,
          name: requestedAttribute.name,
        })
      }

      return acc
    }

    return {
      ...acc,
      [attrKey]: [attributeClaimData[0].cred_info.referent, true],
    }
  }, {})

  return [requestedAttributes, missingAttributes, dissatisfiedAttributes]
}

export function convertIndyPreparedProofToAttributes(
  preparedProof: IndyPreparedProof,
  requestedAttributes: ProofRequestedAttributes
): Array<Attribute> {
  let attributes = Object.keys(requestedAttributes).map((attributeKey) => {
    const label = requestedAttributes[attributeKey].name
    const revealedAttributes = preparedProof.attrs[attributeKey]
    if (revealedAttributes && revealedAttributes.length > 0) {
      return revealedAttributes.map((revealedAttribute) => {
        // convert attrs props to lowercase
        // maintain a mapping that will map case insensitive name to actual name in `attrs`
        let caseInsensitiveMap = null
        if (revealedAttribute) {
          caseInsensitiveMap = Object.keys(
            revealedAttribute.cred_info.attrs
          ).reduce(
            (acc, attributeName) => ({
              ...acc,
              [attributeName.toLowerCase().replace(/ /g, '')]: attributeName,
            }),
            {}
          )
        }

        return {
          label,
          key: attributeKey,
          data:
            revealedAttribute &&
            caseInsensitiveMap &&
            revealedAttribute.cred_info.attrs[
              caseInsensitiveMap[label.toLowerCase().replace(/ /g, '')]
            ],
          claimUuid: revealedAttribute && revealedAttribute.cred_info.referent,
          // TODO:KS Refactor this logic to not put cred_info here
          // We are putting cred_info here because we don't want to iterate
          // later to find whole credential
          cred_info: revealedAttribute ? revealedAttribute : null,
        }
      })
    }

    const attrs = preparedProof.self_attested_attrs
    const selfAttestedAttribute =
      attrs && attrs[label.toLowerCase().trim()].data

    return [
      {
        label,
        data: selfAttestedAttribute,
      },
    ]
  })

  // $FlowFixMe
  return attributes
}

export function convertUserSelectedCredentialToVcxSelectedCredentials(
  userSelectedCredentials: IndyRequestedAttributes
): VcxSelectedCredentials {
  const attrs = Object.keys(userSelectedCredentials).reduce(
    (acc, attributeKey) => ({
      ...acc,
      [attributeKey]: {
        credential: userSelectedCredentials[attributeKey][2],
        tails_file: null,
      },
    }),
    {}
  )

  if (Object.keys(attrs).length === 0) {
    return {}
  }

  return {
    attrs,
  }
}

export function convertSelectedCredentialAttributesToIndyProof(
  userSelectedCredentials: IndyRequestedAttributes
) {
  const credentialFilledAttributes = Object.keys(userSelectedCredentials)

  return credentialFilledAttributes.reduce((acc, attributeKey) => {
    // this will give us the credential which user selected to fulfill attribute
    // the reason we are taking this from userSelectedCredentials is because
    // user might have multiple credential that can fulfill an attribute
    // but user can select only one of the credential to fulfill an attribute
    const selectedAttribute = userSelectedCredentials[attributeKey]
    const selectedCredentialAttributes = selectedAttribute[2].cred_info.attrs
    const caseInsensitiveMap = Object.keys(selectedCredentialAttributes).reduce(
      (acc, attributeName) => ({
        ...acc,
        [attributeName.toLowerCase().replace(/ /g, '')]: attributeName,
      }),
      {}
    )

    // we only have attribute key at this point, we can still get attribute name
    // but then we would have to do a lot of other mapping
    // we should still do that but for now we know that attribute keys are formed
    // by adding _<index> after the name of attribute
    // so we are removing that last _<index> from attribute key and generating attribute name
    // We will remove this logic and have it work without below hack
    // when we will refactor whole proof generation logic
    let attributeLabel = attributeKey.split('_')
    if (attributeLabel.length > 1) {
      attributeLabel = attributeLabel.slice(0, -1)
    }
    attributeLabel = attributeLabel.join('_')
    let attributeValueFromCredential =
      selectedCredentialAttributes[
        caseInsensitiveMap[attributeLabel.toLowerCase().replace(/ /g, '')]
      ]
    // if we find that we did not get the value from credential
    // then attributeLabel must be wrong because this credential
    // was selected by user then that means at time of cred selection
    // it had value. So, we try to get value with attribute key now
    if (!attributeValueFromCredential) {
      attributeValueFromCredential =
        selectedCredentialAttributes[
          caseInsensitiveMap[attributeKey.toLowerCase().replace(/ /g, '')]
        ]
    }

    return {
      ...acc,
      [attributeKey]: [selectedAttribute[0], attributeValueFromCredential],
    }
  }, {})
}

export function* generateProofSaga(action: GenerateProofAction): any {
  try {
    const { uid } = action
    const proofRequestPayload: ProofRequestPayload = yield select(
      getProofRequest,
      uid
    )
    const proofRequest = proofRequestPayload.originalProofRequestData
    let { proofHandle, ephemeralProofRequest } = proofRequestPayload
    let matchingCredentialsJson: ?string = undefined

    // we can have proofHandle as 0 as well
    // if we have proofHandle as 0, that means we need to get proofHandle again
    if (proofHandle === 0 && ephemeralProofRequest) {
      proofHandle = yield call(
        proofCreateWithRequest,
        uid,
        ephemeralProofRequest
      )
      // update proof handle in store, because it would be used by proof-request store
      yield put(updateProofHandle(proofHandle, uid))
    }

    try {
      matchingCredentialsJson = yield call(getMatchingCredentials, proofHandle)
    } catch (e) {
      // the reason why are we doing this here is
      // we persist proofHandle along with proof request
      // proofHandle is given by vcx for the their internal object which is in memory
      // and using that proofHandle we can query data
      // However, if user kills the app, then vcx looses all in memory object
      // and proofHandle that we persisted no longer points to proof object
      // so we catch that exception here and we get new proofHandle
      // and then try to query data again
      // if it fails again, then there must be some error from vcx side which we bubble up

      // the way we achieve what is written above is that we take the serialized proof request
      // from vcx and store that object on our side and then we pass that serialized object
      // back to vcx, so that vcx can create it's internal proof object again
      const serializedProofRequest =
        proofRequestPayload.vcxSerializedProofRequest
      if (serializedProofRequest) {
        // it might happen that we won't have serialized proof request
        // so we guard against it and let fail
        proofHandle = yield call(proofDeserialize, serializedProofRequest)
        // update proof handle in store, because it would be used by proof-request store
        yield put(updateProofHandle(proofHandle, uid))
        matchingCredentialsJson = yield call(
          getMatchingCredentials,
          proofHandle
        )
      }
    }

    if (!matchingCredentialsJson) {
      throw new Error('No matching credential json result')
    }

    const matchingCredentials: IndyPreparedProof = JSON.parse(
      matchingCredentialsJson
    )
    const claimMap: ClaimMap = yield select(getClaimMap)
    //TODO: this is a hack. Right now we are relying on assumption that libindy always returns
    //TODO: credentials in the same oldest-first order. In the next release of libindy we will
    //TODO: include the seq_no of credential and we will sort by it in descendant order
    for (const key in matchingCredentials.attrs) {
      if (
        matchingCredentials.attrs.hasOwnProperty(key) &&
        Array.isArray(matchingCredentials.attrs[key])
      ) {
        matchingCredentials.attrs[key].sort((credA, credB) => {
          if (!credA) {
            return -1
          }
          if (!credB) {
            return 1
          }

          const credAMap = claimMap[credA.cred_info.referent]
          const credBMap = claimMap[credB.cred_info.referent]
          if (!credAMap) {
            return -1
          }
          if (!credBMap) {
            return 1
          }
          const credAEpoch = credAMap.issueDate
          const credBEpoch = credBMap.issueDate

          return credBEpoch - credAEpoch
        })
      }
    }

    const [
      requestedAttrsJson,
      missingAttributes,
      dissatisfiedAttributes,
    ] = convertPreparedProofToRequestedAttributes(
      matchingCredentials,
      proofRequest
    )
    let selfAttestedAttributes: SelfAttestedAttributes = {}

    if (dissatisfiedAttributes.length > 0) {
      // if we find that there are some attributes that are not available
      // in any of the claims stored in user wallet
      // and also proof requester has intended not to accept self-attested-attributes
      // then user cannot fulfill this whole proof request
      // let user know that there are dissatisfied attributes
      yield put(dissatisfiedAttributesFound(dissatisfiedAttributes, uid))

      // as user cannot proceed ahead with accepting proof request
      // we stop this saga here
      return
    }

    if (missingAttributes.length > 0) {
      // if we find that there are some attributes that are not available
      // in any of the claims stored in user wallet
      // then we ask user to fill in those attributes
      // so we need to tell proof request screen to ask user to self attest
      yield put(missingAttributesFound(missingAttributes, uid))

      // once user has filled all attributes, we need to get those details here
      // user filled details become self attested attributes
      const selfAttestedFilledAction: UserSelfAttestedAttributesAction = yield take(
        USER_SELF_ATTESTED_ATTRIBUTES
      )
      selfAttestedAttributes = selfAttestedFilledAction.selfAttestedAttributes
    }

    // auto-fill proof request
    const requestedAttributes = convertIndyPreparedProofToAttributes(
      {
        ...matchingCredentials,
        self_attested_attrs: { ...selfAttestedAttributes },
      },
      proofRequest.requested_attributes
    )
    yield put(proofRequestAutoFill(uid, requestedAttributes))

    yield put(proofRequestDataToStore(uid, proofHandle, selfAttestedAttributes))
  } catch (e) {
    // captureError(e)
    yield put(proofFail(action.uid, e))
  }
}

export function* updateAttributeClaimAndSendProof(
  action: UpdateAttributeClaimAction
): Generator<*, *, *> {
  try {
    yield put(clearSendProofFail(action.uid))
    const { proofHandle, selfAttestedAttributes } = yield select(
      getProofData,
      action.uid
    )
    const requestedAttrsJson = action.requestedAttrsJson
    yield put(sendProof(action.uid))

    const selectedCredentials = convertUserSelectedCredentialToVcxSelectedCredentials(
      requestedAttrsJson
    )
    const selectedSelfAttestedAttributes = convertSelfAttestedToIndySelfAttested(
      selfAttestedAttributes
    )
    yield call(
      generateProof,
      proofHandle,
      JSON.stringify(selectedCredentials),
      JSON.stringify(selectedSelfAttestedAttributes)
    )

    yield put(acceptProofRequest(action.uid))
    // create a proof object so that history store and others that depend on proof
    // can use this proof object, previously proof object was generated with libIndy
    // now that we have removed libIndy and use vcx, we are generating this object
    // We should re-write whole proof generation logic and events in a single saga
    // and merge two stores proof-request-store and proof-store
    const proof: Proof = {
      proofs: {},
      aggregated_proof: {
        c_hash: '',
        c_list: [[0]],
      },
      requested_proof: {
        revealed_attrs: convertSelectedCredentialAttributesToIndyProof(
          requestedAttrsJson
        ),
        unrevealed_attrs: {},
        self_attested_attrs: selectedSelfAttestedAttributes,
        predicates: {},
      },
    }
    yield put(proofSuccess(proof, action.uid))
  } catch (e) {
    // captureError(e)
    yield put(errorSendProofFail(action.uid, action.remoteDid, e))
  }
}

export const reTrySendProof = (
  selfAttestedAttributes: $PropertyType<
    RetrySendProofAction,
    'selfAttestedAttributes'
  >,
  updateAttributeClaimAction: UpdateAttributeClaimAction
) => ({
  type: RETRY_SEND_PROOF,
  selfAttestedAttributes,
  updateAttributeClaimAction,
})

function* reTrySendProofSaga(action: RetrySendProofAction): Generator<*, *, *> {
  const {
    uid,
    remoteDid,
    requestedAttrsJson,
  } = action.updateAttributeClaimAction
  // start proof generation
  yield put(getProof(uid))
  const [missingAttributeFound, proofRequestAutofill] = yield race([
    take(
      (missingAttributeAction) =>
        missingAttributeAction.type === MISSING_ATTRIBUTES_FOUND &&
        missingAttributeAction.uid === uid
    ),
    take(
      (proofRequestAutofillAction) =>
        proofRequestAutofillAction.type === PROOF_REQUEST_AUTO_FILL &&
        proofRequestAutofillAction.uid === uid
    ),
  ])

  if (missingAttributeFound) {
    yield put(userSelfAttestedAttributes(action.selfAttestedAttributes, uid))
  }
  yield take(
    (proofRequestDataStoreAction) =>
      proofRequestDataStoreAction.type === PROOF_REQUEST_SEND_PROOF_HANDLE &&
      proofRequestDataStoreAction.uid === uid
  )
  yield put(updateAttributeClaim(uid, remoteDid, requestedAttrsJson))
}

export function* watchGenerateProof(): any {
  yield takeEvery(GENERATE_PROOF, generateProofSaga)
  yield takeEvery(UPDATE_ATTRIBUTE_CLAIM, updateAttributeClaimAndSendProof)
  yield takeEvery(RETRY_SEND_PROOF, reTrySendProofSaga)
}

export function* watchProof(): any {
  yield all([watchGenerateProof()])
}

const initialState = {}

export default function proofReducer(
  state: ProofStore = initialState,
  action: ProofAction
) {
  switch (action.type) {
    case PROOF_SUCCESS: {
      return {
        ...state,
        [action.uid]: {
          ...state[action.uid],
          ...action.proof,
        },
      }
    }

    case PROOF_FAIL:
      return {
        ...state,
        [action.uid]: {
          ...state[action.uid],
          error: action.error,
        },
      }

    case PROOF_REQUEST_SHOW_START: {
      return {
        ...state,
        [action.uid]: undefined,
      }
    }

    case PROOF_REQUEST_SEND_PROOF_HANDLE: {
      return {
        ...state,
        [action.uid]: {
          ...state[action.uid],
          proofData: {
            proofHandle: action.proofHandle,
            selfAttestedAttributes: action.selfAttestedAttributes,
          },
        },
      }
    }

    case RESET_TEMP_PROOF_DATA: {
      return {
        ...state,
        [action.uid]: {
          ...state[action.uid],
          proofData: null,
        },
      }
    }

    case ERROR_SEND_PROOF: {
      return {
        ...state,
        [action.uid]: {
          ...state[action.uid],
          proofData: {
            ...state[action.uid].proofData,
            error: action.error,
          },
        },
      }
    }

    case CLEAR_ERROR_SEND_PROOF: {
      return {
        ...state,
        [action.uid]: {
          ...state[action.uid],
          proofData: {
            ...state[action.uid].proofData,
            error: null,
          },
        },
      }
    }

    case RESET:
      return initialState

    default:
      return state
  }
}
