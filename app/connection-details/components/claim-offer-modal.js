// @flow
import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import { withNavigation } from 'react-navigation'
import { bindActionCreators } from 'redux'
import { claimOfferNewRoute } from '../../common/route-constants'
import { BigNumber } from 'bignumber.js'

import type { Store } from '../../store/type-store'
import type {
  ClaimOfferPayload,
  ClaimProofNavigation,
  TokenFeesData,
} from '../../claim-offer/type-claim-offer'

import CredentialPriceInfo from '../../components/labels/credential-price-info'
import { ModalHeader } from './modal-header'
import { ModalContent } from './modal-content'
import { ModalButtons } from '../../components/buttons/modal-buttons'
import { newConnectionSeen } from '../../connection-history/connection-history-store'
import { measurements } from '../../../app/common/styles/measurements'
import { LedgerFees } from '../../ledger/components/ledger-fees/ledger-fees'
import PaymentTransactionInfo from '../../claim-offer/components/payment-transaction-info'
import {
  getConnectionLogoUrl,
  getConnectionTheme,
  getThereIsANewAgreement,
  getAlreadySignedAgreement,
} from '../../store/store-selector'
import {
  acceptClaimOffer,
  claimOfferIgnored,
  claimOfferShowStart,
  resetClaimRequestStatus,
  denyClaimOffer,
} from '../../claim-offer/claim-offer-store'
import { withBottomUpSliderScreen } from '../../components/bottom-up-slider-screen/bottom-up-slider-screen'
import { txnAuthorAgreementRoute } from '../../common'
import {
  CLAIM_OFFER_STATUS,
  CLAIM_REQUEST_STATUS,
} from '../../claim-offer/type-claim-offer'
import { animateLayout } from '../../common/layout-animation'

class ClaimOfferModal extends Component<any, *> {
  constructor(props) {
    super(props)
    if (props.uid) {
      props.claimOfferShowStart(props.uid)
    }
  }

  state = {
    shouldShowTransactionInfo: false,
  }

  render() {
    const {
      claimOfferData,
      isValid,
      logoUrl,
      claimThemePrimary,
      claimThemeSecondary,
      claimPrice,
    } = this.props
    const {
      status,
      claimRequestStatus,
      issuer,
      data,
      payTokenValue,
    }: ClaimOfferPayload = claimOfferData
    const { shouldShowTransactionInfo } = this.state

    // We need to check if user has accepted cred offer
    // if not a paid cred, then by clicking accept
    // if paid cred, then by confirm & pay button
    // as soon as user accepts the cred offer, redux state will change
    const isClaimOfferAccepted = status === CLAIM_OFFER_STATUS.ACCEPTED

    let acceptButtonText = payTokenValue ? 'Accept & Pay' : 'Accept'
    // NOTE: Just to be safe, we changed the hasNotAcceptedTAA to hardcoded false, so we can be sure 0 tokens doesn't affect the flow.
    const hasNotAcceptedTAA = false
    // (!this.props.alreadySignedAgreement || this.props.thereIsANewAgreement) &&
    // new BigNumber(claimPrice).isGreaterThan(0)

    return (
      <View style={styles.modalWrapper}>
        <ModalHeader
          institutialName={claimOfferData.issuer.name}
          credentialName={
            hasNotAcceptedTAA
              ? 'Please sign the Transaction Author Agreement before continuing'
              : claimOfferData.data.name
          }
          credentialText={
            hasNotAcceptedTAA
              ? 'is offering a paid credential'
              : 'is offering to issue you'
          }
          imageUrl={this.props.logoUrl}
          colorBackground={this.props.claimThemePrimary}
        />

        {
          // if we don't show ledger txn fees, then show credential data
          // i.e. user has not taken any action on credential modal
          // it doesn't matter whether TAA is accepted or not
          // show credential data without needing to consider TAA status
        }
        {shouldShowTransactionInfo === false && (
          <ModalContent
            content={this.props.claimOfferData.data.revealedAttributes}
            uid={this.props.uid}
            remotePairwiseDID={issuer.did}
          />
        )}

        {
          // if this is a paid cred and user has clicked 'Agree & Pay'
          // and if user has not already accepted cred offer
          // we are not considering TAA status here because
          // shouldShowTransactionInfo state is only set
          // after TAA is accepted
          // so if shouldShowTransactionInfo == true, then TAA is also set
        }
        {shouldShowTransactionInfo && !isClaimOfferAccepted && (
          <LedgerFees
            render={this.renderLedgerFeesPhases}
            onStateChange={this.updateState}
            transferAmount={this.props.claimPrice}
          />
        )}

        {
          // Above code block was dealing with ledger fees is user
          // has not yet accepted cred offer
          // But if user has accepted cred offer, and this cred offer
          // is a paid cred offer
          // then we need to show user the status of payment as well
          // so, will keep modal open till user sees success payment
        }
        {shouldShowTransactionInfo && isClaimOfferAccepted && (
          <PaymentTransactionInfo
            claimThemePrimary={this.props.claimThemePrimary}
            claimThemeSecondary={this.props.claimThemeSecondary}
            onConfirmAndPay={this.onConfirmAndPay}
            onCancel={this.onIgnore}
            credentialPrice={this.props.claimPrice}
            claimRequestStatus={claimRequestStatus}
            onSuccess={this.onPaymentSuccess}
            onRetry={this.onConfirmAndPay}
          />
        )}

        {
          // if user has not accepted TAA
          // then no matter what is the state of cred offer
          // always show TAA accept button to user
        }
        {hasNotAcceptedTAA && (
          <ModalButtons
            onPress={this.agree}
            onIgnore={this.onIgnore}
            colorBackground={this.props.claimThemePrimary}
            secondColorBackground={this.props.claimThemeSecondary}
            leftBtnText={'Close'}
            rightBtnText={'Read and Sign TAA'}
          />
        )}

        {
          // if user accepted TAA
          // and user has not yet taken any action on cred offer
          // then show Accept, Ignore buttons
        }
        {hasNotAcceptedTAA === false &&
          shouldShowTransactionInfo === false &&
          !isClaimOfferAccepted && (
            <ModalButtons
              onPress={this.onAccept}
              onIgnore={this.onDeny}
              colorBackground={this.props.claimThemePrimary}
              secondColorBackground={this.props.claimThemeSecondary}
              leftBtnText={'Reject'}
              rightBtnText={acceptButtonText}
              buttonsWrapperStyles={{
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
              }}
            >
              <CredentialPriceInfo price={payTokenValue || ''} />
            </ModalButtons>
          )}
      </View>
    )
  }

  renderLedgerFeesPhases = (txnFeesStatus, feesData, retry) => (
    <PaymentTransactionInfo
      claimThemePrimary={this.props.claimThemePrimary}
      claimThemeSecondary={this.props.claimThemeSecondary}
      onConfirmAndPay={this.onConfirmAndPay}
      onCancel={this.onIgnore}
      credentialPrice={this.props.claimPrice}
      txnFeesStatus={txnFeesStatus}
      onRetry={retry}
      feesData={feesData}
    />
  )

  componentDidMount = () => {
    this.props.newConnectionSeen(this.props.claimOfferData.issuer.did)
    if (
      (!this.props.alreadySignedAgreement || this.props.thereIsANewAgreement) &&
      new BigNumber(this.props.claimPrice).isGreaterThan(0)
    ) {
      this.props.navigation.navigate(txnAuthorAgreementRoute)
    }
  }

  componentWillUnmount() {
    // if modal is being closed, and status of claim request is error
    // then we need to reset status for next time
    const errorStates = [
      CLAIM_REQUEST_STATUS.CLAIM_REQUEST_FAIL,
      CLAIM_REQUEST_STATUS.SEND_CLAIM_REQUEST_FAIL,
      CLAIM_REQUEST_STATUS.INSUFFICIENT_BALANCE,
      CLAIM_REQUEST_STATUS.PAID_CREDENTIAL_REQUEST_FAIL,
    ]
    if (errorStates.includes(this.props.claimOfferData.claimRequestStatus)) {
      this.props.resetClaimRequestStatus(this.props.uid)
    }
  }

  agree = () => {
    this.props.navigation.navigate(txnAuthorAgreementRoute)
  }

  onIgnore = () => {
    this.props.claimOfferIgnored(this.props.uid)
    this.hideModal()
  }

  onDeny = () => {
    this.props.denyClaimOffer(this.props.uid)
    this.hideModal()
  }

  onClose = () => {
    this.hideModal()
  }

  onAccept = () => {
    // if not a paid cred, then just accept claim offer, and close modal
    const { payTokenValue }: ClaimOfferPayload = this.props.claimOfferData
    if (!payTokenValue) {
      this.onConfirmAndPay(true)
      return
    }

    // if paid cred, then start loading ledger txn fees
    const { shouldShowTransactionInfo } = this.state
    if (shouldShowTransactionInfo === false) {
      this.setState({ shouldShowTransactionInfo: true })
      animateLayout()
    }
  }

  hideModal = () => {
    this.props.navigation.goBack(null)
  }

  updateState = (status: string, feesData?: TokenFeesData) => {
    const claimOfferStatus =
      this.props.claimOfferData && this.props.claimOfferData.status
    const claimRequestStatus = this.props.claimOfferData.claimRequestStatus
    if (
      status === 'ZERO_FEES' &&
      claimOfferStatus !== 'ACCEPTED' &&
      claimRequestStatus === 'NONE'
    ) {
      setTimeout(this.onConfirmAndPay, 2000)
    }
  }

  onConfirmAndPay = (shouldHideModal = false) => {
    this.props.acceptClaimOffer(
      this.props.uid,
      this.props.claimOfferData.issuer.did
    )
    if (shouldHideModal === true) {
      this.hideModal()
    } else {
      animateLayout()
    }
  }

  onPaymentSuccess = () => {
    this.onClose()
  }
}

const mapStateToProps = (
  state: Store,
  {
    navigation: {
      state: { params },
    },
  }: ClaimProofNavigation
) => {
  const { claimOffer } = state
  const { uid } = params || { uid: '' }
  const claimOfferData = claimOffer[uid]
  const logoUrl = getConnectionLogoUrl(state, claimOfferData.remotePairwiseDID)
  const themeForLogo = getConnectionTheme(state, logoUrl)
  const isValid =
    claimOfferData &&
    claimOfferData.data &&
    claimOfferData.issuer &&
    claimOfferData.data.revealedAttributes

  // NOTE:
  const claimPrice = claimOfferData.payTokenValue
    ? claimOfferData.payTokenValue
    : '0'

  return {
    thereIsANewAgreement: getThereIsANewAgreement(state),
    alreadySignedAgreement: getAlreadySignedAgreement(state),
    claimThemePrimary: themeForLogo.primary,
    claimThemeSecondary: themeForLogo.secondary,
    uid,
    claimOfferData,
    isValid,
    logoUrl,
    claimPrice,
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      acceptClaimOffer,
      claimOfferIgnored,
      claimOfferShowStart,
      resetClaimRequestStatus,
      newConnectionSeen,
      denyClaimOffer,
    },
    dispatch
  )

export default withBottomUpSliderScreen(
  { routeName: claimOfferNewRoute },
  withNavigation(connect(mapStateToProps, mapDispatchToProps)(ClaimOfferModal))
)

const styles = StyleSheet.create({
  modalWrapper: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    height: measurements.WINDOW_HEIGHT * 0.85,
  },
})
