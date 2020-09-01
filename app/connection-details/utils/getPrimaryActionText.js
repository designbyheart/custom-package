// @flow
import type { MissingAttributes } from '../../proof-request/type-proof-request'
import {
  PRIMARY_ACTION_SEND,
  PRIMARY_ACTION_GENERATE_PROOF,
} from '../../proof-request/type-proof-request'

export function getPrimaryActionText(
  missingAttributes: MissingAttributes | {},
  generateProofClicked: boolean
) {
  if (generateProofClicked) {
    return PRIMARY_ACTION_SEND
  }

  return Object.keys(missingAttributes).length > 0
    ? PRIMARY_ACTION_GENERATE_PROOF
    : PRIMARY_ACTION_SEND
}
