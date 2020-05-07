// @flow
import type { ConnectionHistoryEvent } from '../../connection-history/type-connection-history'
import { acceptClaimOffer } from '../../claim-offer/claim-offer-store'
import { reTrySendProof } from '../../proof/proof-store'

export type RecentCardProps = {
  timestamp: string,
  statusMessage: string,
  issuerName: string,
  logoUrl: string,
  status: string,
  item: ConnectionHistoryEvent,
  acceptClaimOffer: typeof acceptClaimOffer,
  reTrySendProof: typeof reTrySendProof,
}
