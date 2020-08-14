// @flow
import type { ReactNavigation, GenericObject } from '../common/type-common'
import type { ClaimOfferPayload } from '../claim-offer/type-claim-offer'

export type MyCredentialsProps = {
  offers: ClaimOffers,
  environmentName: string,
} & ReactNavigation

export type Item = {
  claimOfferUuid: string,
  credentialName: string,
  date?: number,
  attributesCount: number,
  logoUrl?: ?string,
}

export type ClaimOffers = {
  +[string]: ClaimOfferPayload,
}