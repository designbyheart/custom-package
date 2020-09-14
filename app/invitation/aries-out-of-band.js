// @flow
import type { AriesOutOfBandInvite, InvitationPayload } from './type-invitation'
import { CONNECTION_INVITE_TYPES } from './type-invitation'
import { ID } from '../common/type-common'
import isUrl from 'validator/lib/isURL'

export const ariesOutOfBandInvitationToInvitationPayload = (
  invitation: AriesOutOfBandInvite
): InvitationPayload | null => {
  const serviceEntry = invitation.service.find(
    (serviceEntry) => typeof serviceEntry === 'object'
  )
  if (typeof serviceEntry !== 'object') {
    return null
  }

  const senderAgentKeyDelegationProof = {
    agentDID: serviceEntry.recipientKeys[0],
    agentDelegatedKey: serviceEntry.recipientKeys[0],
    signature: '<no-signature-supplied>',
  }

  return {
    senderEndpoint: serviceEntry.serviceEndpoint,
    requestId: invitation[ID],
    senderAgentKeyDelegationProof,
    senderName: invitation.label || 'Unknown',
    senderDID: serviceEntry.recipientKeys[0],
    senderLogoUrl:
      invitation.profileUrl && isUrl(invitation.profileUrl)
        ? invitation.profileUrl
        : null,
    senderVerificationKey: serviceEntry.recipientKeys[0],
    targetName: invitation.label || 'Unknown',
    senderDetail: {
      name: invitation.label || 'Unknown',
      agentKeyDlgProof: senderAgentKeyDelegationProof,
      DID: serviceEntry.recipientKeys[0],
      logoUrl:
        invitation.profileUrl && isUrl(invitation.profileUrl)
          ? invitation.profileUrl
          : null,
      verKey: serviceEntry.recipientKeys[0],
      publicDID: serviceEntry.recipientKeys[0],
    },
    senderAgencyDetail: {
      DID: serviceEntry.recipientKeys[0],
      verKey: serviceEntry.recipientKeys[1],
      endpoint: serviceEntry.serviceEndpoint,
    },
    type: CONNECTION_INVITE_TYPES.ARIES_OUT_OF_BAND,
    version: '1.0',
    original: JSON.stringify(invitation),
    originalObject: invitation,
  }
}
