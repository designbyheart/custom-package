// @flow
import type { ReactNavigation, GenericObject } from '../common/type-common'
import type { ClaimOfferPayload } from '../claim-offer/type-claim-offer'
import type { Attribute } from '../push-notification/type-push-notification'

export type MyCredentialsProps = {
  offers: ClaimOffers,
  environmentName: string,
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