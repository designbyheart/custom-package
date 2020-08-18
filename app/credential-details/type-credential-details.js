//@flow
import type { Attribute } from '../push-notification/type-push-notification'

export type CredentialDetailsProps = {
  route: {
    params: {
      credentialName: string,
      claimUuid: string,
      issuerName: string,
      date: number,
      attributes: Array<Attribute>,
      logoUrl: string,
      remoteDid: string,
      uid: string,
    }
  }
}