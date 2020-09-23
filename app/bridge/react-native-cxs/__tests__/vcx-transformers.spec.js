// @flow

import {
  convertAgencyConfigToVcxProvision,
  convertVcxProvisionResultToUserOneTimeInfo,
  convertCxsInitToVcxInit,
  convertInvitationToVcxConnectionCreate,
  convertVcxCredentialOfferToCxsClaimOffer,
  convertCxsPoolInitToVcxPoolInit,
} from '../vcx-transformers'
import {
  vcxProvisionResult,
  agencyUrl,
  agencyDID,
  agencyVerificationKey,
  poolConfig,
  paymentMethod,
  userOneTimeInfo,
  getTestInvitationPayload,
  vcxClaimOffer,
} from '../../../../__mocks__/static-data'

const agencyPoolConfig = {
  agencyUrl,
  agencyDID,
  agencyVerificationKey,
  poolConfig,
  paymentMethod,
}

const initWithGenesisPathConfig = {
  ...userOneTimeInfo,
  ...agencyPoolConfig,
  genesis_path: 'genesis_path',
}

const initPoolConfig = {
  poolConfig,
  genesis_path: 'genesis_path',
}

const walletPoolName = {
  walletName: 'walletName',
  poolName: 'poolName',
}

describe('transformer:VCX', () => {
  it('convertAgencyConfigToVcxProvision', async () => {
    const vcxProvisionConfig = await convertAgencyConfigToVcxProvision(
      agencyPoolConfig,
      walletPoolName
    )
    expect(vcxProvisionConfig).toMatchSnapshot()
  })

  it('convertVcxProvisionResultToUserOneTimeInfo', () => {
    expect(
      convertVcxProvisionResultToUserOneTimeInfo(vcxProvisionResult)
    ).toMatchSnapshot()
  })

  it('convertCxsInitToVcxInit', async () => {
    const vcxInitConfig = await convertCxsInitToVcxInit(
      initWithGenesisPathConfig,
      walletPoolName
    )
    expect(vcxInitConfig).toMatchSnapshot()
  })

  it('convertCxsPoolInitToVcxPoolInit', async () => {
    const vcxInitPoolConfig = await convertCxsPoolInitToVcxPoolInit(
      initPoolConfig,
      walletPoolName
    )
    expect(vcxInitPoolConfig).toMatchSnapshot()
  })

  it('convertInvitationToVcxConnectionCreate', () => {
    const gen = getTestInvitationPayload()
    const invitation = gen.next().value
    if (invitation) {
      expect(
        convertInvitationToVcxConnectionCreate(invitation.payload)
      ).toMatchSnapshot()
    }
  })

  it('convertInvitationToVcxConnectionCreate with version', () => {
    const gen = getTestInvitationPayload()
    const invitation = gen.next().value
    if (invitation) {
      expect(
        convertInvitationToVcxConnectionCreate({
          ...invitation.payload,
          version: '2.0',
        })
      ).toMatchSnapshot()
    }
  })

  it('convertVcxCredentialOfferToCxsClaimOffer', () => {
    expect(
      convertVcxCredentialOfferToCxsClaimOffer(vcxClaimOffer)
    ).toMatchSnapshot()
  })
})
