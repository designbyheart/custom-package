// @flow
import { INITIAL_TEST_ACTION } from '../common/type-common'
import type {
  CustomError,
  GenericObject,
  MessageAnnotation,
  TopicAnnotation,
  ReactNavigation,
  GenericStringObject,
  ResetAction,
  ImageSource,
  NotificationPayload,
  RequestedAttrsJson,
} from '../common/type-common'
import type {
  Attribute,
  NotificationPayloadInfo,
} from '../push-notification/type-push-notification'
import type { ClaimMap } from '../claim/type-claim'
import { updateAttributeClaim } from '../proof/proof-store'

export type RequestedAttribute = {|
  name: string,
  self_attest_allowed?: boolean,
|}

export type RequestedPredicates = {
  attr_name: string,
  p_type: string,
  value: number,
  schema_seq_no?: number,
  issuer_did?: string,
}

export type ProofRequestedAttributes = {
  +[string]: RequestedAttribute,
}

export type ProofRequestData = {
  nonce: string,
  name: string,
  version: string,
  requested_attributes: ProofRequestedAttributes,
  requested_predicates?: ?{
    +[string]: RequestedPredicates,
  },
}

export type ProofRequest = {
  '@topic': {
    mid: number,
    tid: number,
  },
  '@type': {
    name: string,
    version: string,
  },
  msg_ref_id: string,
  proof_request_data: ProofRequestData,
}

export type StringifiableProofRequest = {
  data: {
    agent_did: null,
    agent_vk: null,
    link_secret_alias: string,
    my_did: null,
    my_vk: null,
    proof: null,
    proof_request: ?ProofRequest,
    source_id: string,
    state: number,
    their_did: null,
    their_vk: null,
  },
  version: string,
}

export type ProofRequestPushPayload = {
  '@type': MessageAnnotation,
  '@topic': TopicAnnotation,
  intended_use?: string,
  proof_request_data: ProofRequestData,
  remoteName: string,
  proofHandle: number,
  ephemeralProofRequest?: string,
}

export type ProofApiData = {
  requested: {
    +[string]: Array<string>,
  },
  remoteDid: string,
  userPairwiseDid?: string,
  claim_proofs: {
    +[string]: Array<string>,
  },
  aggregated_proof: string,
}

export type AdditionalProofData = {
  name: string,
  version: string,
  requestedAttributes: Array<Attribute>,
}

export type AdditionalProofDataPayload = {
  data: AdditionalProofData,
  requester: {
    name: string,
  },
  originalProofRequestData: ProofRequestData,
  statusMsg?: string,
  proofHandle: number,
  ephemeralProofRequest?: string,
}

export type ProofRequestAttributeListProp = {
  list: Array<Attribute>,
  claimMap?: ?ClaimMap,
  missingAttributes: MissingAttributes | {},
  canEnablePrimaryAction: (
    canEnable: boolean,
    selfAttestedAttributes: GenericStringObject
  ) => void,
  disableUserInputs: boolean,
  userAvatarSource: ?ImageSource,
  updateSelectedClaims: (item: Attribute) => void,
}

export type ProofRequestAttributeListState = {
  [string]: string,
}

export type ProofModalState = {
  isVisible: boolean,
}

export type ProofModalProps = {
  proofStatus: ProofStatus,
  name: string,
  title: string,
  logoUrl: string,
  onContinue: () => void,
}

export const NO_SELF_ATTEST: 'NO_SELF_ATTEST' = 'NO_SELF_ATTEST'
export const NO_CRED_NO_SELF_ATTEST: 'NO_CRED_NO_SELF_ATTEST' =
  'NO_CRED_NO_SELF_ATTEST'
export type DissatisfiedAttribute = {|
  name: string,
  reason: typeof NO_SELF_ATTEST | typeof NO_CRED_NO_SELF_ATTEST,
|}

export type ProofRequestPayload = AdditionalProofDataPayload & {
  status: ProofRequestStatus,
  proofStatus: ProofStatus,
  uid: string,
  senderLogoUrl?: ?string,
  remotePairwiseDID: string,
  missingAttributes?: MissingAttributes,
  vcxSerializedProofRequest?: string,
  // this key will be used to indicate that this proof request
  // cannot be fulfilled by credentials that are in user's wallet
  // nor user can fill self attested values inside empty attributes
  // value inside this key will tell reason that cannot fulfill each attribute
  dissatisfiedAttributes?: DissatisfiedAttribute[],
}

export type ProofRequestProps = {
  isValid: boolean,
  data: AdditionalProofData,
  logoUrl: string,
  proofStatus: ProofStatus,
  originalProofRequestData: ProofRequestData,
  remotePairwiseDID: string,
  name: string,
  errorProofSendData: ?CustomError,
  colorBackground: string,
  secondColorBackground: string,
  ignoreProofRequest: (uid: string) => void,
  rejectProofRequest: (uid: string) => void,
  acceptProofRequest: (uid: string) => void,
  proofRequestShown: (uid: string) => void,
  updateAttributeClaim: typeof updateAttributeClaim,
  getProof: (uid: string) => void,
  uid: string,
  proofGenerationError?: ?CustomError,
  claimMap?: ?ClaimMap,
  missingAttributes: MissingAttributes | {},
  userSelfAttestedAttributes: (
    selfAttestedAttributes: SelfAttestedAttributes,
    uid: string
  ) => void,
  userAvatarSource: ?ImageSource,
  proofRequestShowStart: (uid: string) => ProofRequestShowStartAction,
  newConnectionSeen: (senderDID: string) => void,
  hideModal: () => void,
  dissatisfiedAttributes: DissatisfiedAttribute[],
  denyProofRequest: (uid: string) => void,
} & ReactNavigation

export type ProofRequestState = {
  allMissingAttributesFilled: boolean,
  generateProofClicked: boolean,
  selfAttestedAttributes: GenericStringObject,
  disableUserInputs: boolean,
  selectedClaims: RequestedAttrsJson,
  disableSendButton: boolean,
}

export const PROOF_REQUESTS = 'PROOF_REQUESTS'
export const PROOF_REQUEST_RECEIVED = 'PROOF_REQUEST_RECEIVED'
export type ProofRequestReceivedAction = {
  type: typeof PROOF_REQUEST_RECEIVED,
  payload: AdditionalProofDataPayload,
  payloadInfo: NotificationPayloadInfo,
}

export const PROOF_REQUEST_STATUS = {
  IDLE: 'IDLE',
  RECEIVED: 'RECEIVED',
  SHOWN: 'SHOWN',
  ACCEPTED: 'ACCEPTED',
  IGNORED: 'IGNORED',
  REJECTED: 'REJECTED',
}

export const PROOF_STATUS = {
  NONE: 'NONE',
  SENDING_PROOF: 'SENDING_PROOF',
  SEND_PROOF_FAIL: 'SEND_PROOF_FAIL',
  SEND_PROOF_SUCCESS: 'SEND_PROOF_SUCCESS',
}

export type ProofRequestStatus = $Keys<typeof PROOF_REQUEST_STATUS>
export type ProofStatus = $Keys<typeof PROOF_STATUS>

export const PROOF_REQUEST_SHOWN = 'PROOF_REQUEST_SHOWN'
export type ProofRequestShownAction = {
  type: typeof PROOF_REQUEST_SHOWN,
  uid: string,
}

export const SEND_PROOF_SUCCESS = 'SEND_PROOF_SUCCESS'
export type SendProofSuccessAction = {
  type: typeof SEND_PROOF_SUCCESS,
  uid: string,
}

export const HYDRATE_PROOF_REQUESTS = 'HYDRATE_PROOF_REQUESTS'
export type HydrateProofRequestsAction = {
  type: typeof HYDRATE_PROOF_REQUESTS,
  proofRequests: ProofRequestStore,
}

export const SEND_PROOF_FAIL = 'SEND_PROOF_FAIL'
export type SendProofFailAction = {
  type: typeof SEND_PROOF_FAIL,
  uid: string,
  error: CustomError,
}

export const SEND_PROOF = 'SEND_PROOF'
export type SendProofAction = {
  type: typeof SEND_PROOF,
  uid: string,
}

export const PROOF_REQUEST_IGNORED = 'PROOF_REQUEST_IGNORED'
export type ProofRequestIgnoredAction = {
  type: typeof PROOF_REQUEST_IGNORED,
  uid: string,
}

export const PROOF_REQUEST_REJECTED = 'PROOF_REQUEST_REJECTED'
export type ProofRequestRejectedAction = {
  type: typeof PROOF_REQUEST_REJECTED,
  uid: string,
}

export const PROOF_REQUEST_ACCEPTED = 'PROOF_REQUEST_ACCEPTED'
export type ProofRequestAcceptedAction = {
  type: typeof PROOF_REQUEST_ACCEPTED,
  uid: string,
}

export const PROOF_REQUEST_AUTO_FILL = 'PROOF_REQUEST_AUTO_FILL'
export type ProofRequestAutoFillAction = {
  type: typeof PROOF_REQUEST_AUTO_FILL,
  uid: string,
  requestedAttributes: Array<Attribute>,
}

export type MissingAttribute = {
  key: string,
  name: string,
}

export type SelfAttestedAttribute = {
  name: string,
  data: string,
  key: string,
}

export type SelfAttestedAttributes = {
  [attributeName: string]: SelfAttestedAttribute,
}

export type MissingAttributes = SelfAttestedAttributes

export type IndySelfAttested = GenericStringObject

export const MISSING_ATTRIBUTES_FOUND = 'MISSING_ATTRIBUTES_FOUND'
export type MissingAttributesFoundAction = {
  type: typeof MISSING_ATTRIBUTES_FOUND,
  missingAttributes: MissingAttributes,
  uid: string,
}

export type ProofRequestInitialAction = {
  type: typeof INITIAL_TEST_ACTION,
}

export const PROOF_SERIALIZED = 'PROOF_SERIALIZED'
export type ProofSerializedAction = {
  type: typeof PROOF_SERIALIZED,
  serializedProof: string,
  uid: string,
}

export const UPDATE_PROOF_HANDLE = 'UPDATE_PROOF_HANDLE'
export type UpdateProofHandleAction = {
  type: typeof UPDATE_PROOF_HANDLE,
  proofHandle: number,
  uid: string,
}

export const PROOF_REQUEST_SHOW_START = 'PROOF_REQUEST_SHOW_START'
export type ProofRequestShowStartAction = {
  type: typeof PROOF_REQUEST_SHOW_START,
  uid: string,
}

export const PROOF_REQUEST_DISSATISFIED_ATTRIBUTES_FOUND: 'PROOF_REQUEST_DISSATISFIED_ATTRIBUTES_FOUND' =
  'PROOF_REQUEST_DISSATISFIED_ATTRIBUTES_FOUND'
export type ProofRequestDissatisfiedAttributesFoundAction = {
  type: typeof PROOF_REQUEST_DISSATISFIED_ATTRIBUTES_FOUND,
  uid: string,
  dissatisfiedAttributes: DissatisfiedAttribute[],
}

export const DENY_PROOF_REQUEST: 'DENY_PROOF_REQUEST' = 'DENY_PROOF_REQUEST'
export type DenyProofRequestAction = {
  type: typeof DENY_PROOF_REQUEST,
  uid: string,
}

export const DENY_PROOF_REQUEST_FAIL = 'DENY_PROOF_REQUEST_FAIL'
export type DenyProofRequestFailAction = {
  type: typeof DENY_PROOF_REQUEST_FAIL,
  uid: string,
}

export const DENY_PROOF_REQUEST_SUCCESS: 'DENY_PROOF_REQUEST_SUCCESS' =
  'DENY_PROOF_REQUEST_SUCCESS'
export type DenyProofRequestSuccessAction = {
  type: typeof DENY_PROOF_REQUEST_SUCCESS,
  uid: string,
}

export type ProofRequestAction =
  | ProofRequestReceivedAction
  | SendProofSuccessAction
  | SendProofFailAction
  | SendProofAction
  | ProofRequestIgnoredAction
  | ProofRequestAcceptedAction
  | ProofRequestShownAction
  | ProofRequestInitialAction
  | ProofRequestRejectedAction
  | ProofRequestAutoFillAction
  | MissingAttributesFoundAction
  | ProofSerializedAction
  | UpdateProofHandleAction
  | ProofRequestShowStartAction
  | ResetAction
  | ProofRequestDissatisfiedAttributesFoundAction
  | DenyProofRequestAction
  | DenyProofRequestSuccessAction
  | DenyProofRequestFailAction

export type ProofRequestStore = {
  +[string]: ProofRequestPayload,
}

export type QrCodeEphemeralProofRequest = {
  originalMessage: string,
  ephemeralProofRequest: {
    '@id': string,
    '@type': string,
    'request_presentations~attach': Array<{
      '@id': string,
      'mime-type': string,
      data: {
        base64: string,
      },
    }>,
    comment: ?string,
    '~service': {
      recipientKeys: Array<string>,
      routingKeys: ?Array<string>,
      serviceEndpoint: string,
    },
  },
  proofRequestPayload: AdditionalProofDataPayload,
}

export const PRIMARY_ACTION_SEND = 'Send'
export const PRIMARY_ACTION_GENERATE_PROOF = 'Generate'
export const SECONDARY_ACTION_IGNORE = 'Ignore'

export const MESSAGE_MISSING_ATTRIBUTES_TITLE = 'Missing information'
export const MESSAGE_MISSING_ATTRIBUTES_DESCRIPTION = (
  connectionName: string
) =>
  `You don't have all the attributes ${connectionName} is asking you to share with them. Manually fill in the missing attributes and tap Generate.`

export const MESSAGE_ERROR_PROOF_GENERATION_TITLE = 'Error generating proof'
export const MESSAGE_ERROR_PROOF_GENERATION_DESCRIPTION = 'Please try again.'

export const ERROR_SEND_PROOF = (message: string) => ({
  code: 'PR-001',
  message: `Error sending proof: ${message}`,
})

export const MESSAGE_ERROR_DISSATISFIED_ATTRIBUTES_TITLE = 'Missing Credentials'
export const MESSAGE_ERROR_DISSATISFIED_ATTRIBUTES_DESCRIPTION = (
  attributes: DissatisfiedAttribute[],
  connectionName: string
) => `You are unable to fulfill this request from ${connectionName}. This could be because

- You don’t have the required credentials in your Connect.Me wallet
- ${connectionName} has indicated you may not type your own answers to certain fields in this request
- Some of the attributes ${connectionName} is requesting come from credentials you own that have been revoked or expired

Specifically, you are missing credentials with the following attributes:
- ${attributes.map((attribute) => attribute.name).join('\n- ')}

Contact ${connectionName} for more information.

Pressing IGNORE will dismiss the request, and allow you to find and fulfill it later when you are able to fulfill this request, and will send no response notification back to ${connectionName}.

Pressing REJECT will notify ${connectionName}. They will not know you are unable to fulfill the request, only that you have rejected it.`
