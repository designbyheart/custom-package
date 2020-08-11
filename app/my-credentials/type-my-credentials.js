// @flow
import type { ReactNavigation, GenericObject } from '../common/type-common'
import type { ClaimMap } from '../claim/type-claim'
import type { ClaimOfferPayload } from '../claim-offer/type-claim-offer'

export type MyCredentialsProps = {
  claimMap: ClaimMap,
  offers: ClaimOffers,
  environmentName: string,
} & ReactNavigation

export type Item = {
  claimUuid: string,
  credentialName: string,
  date: number,
  attributesCount: number,
  logoUrl: string,
}

export type ClaimOffers = {
  +[string]: ClaimOfferPayload,
}

export type NewCredentialInstructionsProps = {
  usingProductionNetwork: boolean,
}