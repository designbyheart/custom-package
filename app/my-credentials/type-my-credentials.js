// @flow
import type { ReactNavigation } from '../common/type-common'
import type { ClaimOfferPayload } from '../claim-offer/type-claim-offer'
import type { Attribute } from '../push-notification/type-push-notification'
import { deleteClaim } from '../claim/claim-store'

export type MyCredentialsProps = {
  offers: ClaimOffers,
  environmentName: string,
  deleteClaim: typeof deleteClaim,
} & ReactNavigation

export type CredentialItem = {
  claimOfferUuid: string,
  credentialName: string,
  issuerName: string,
  date?: number,
  attributes: Array<Attribute>,
  logoUrl?: ?string,
}

export type ClaimOffers = {
  +[string]: ClaimOfferPayload,
}

export type NewCredentialInstructionsProps = {
  usingProductionNetwork: boolean,
}

export const MESSAGE_DELETE_CLAIM_TITLE = 'Delete credential?'
export const MESSAGE_DELETE_CLAIM_DESCRIPTION = 'This cannot be undone.'
