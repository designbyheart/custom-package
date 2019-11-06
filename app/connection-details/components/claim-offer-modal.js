// @flow
import React from 'react'
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Text,
  Dimensions,
  Animated,
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import CredentialPriceInfo from '../../components/labels/credential-price-info'
import type { Store } from '../../store/type-store'
import type {
  ClaimOfferProps,
  ClaimOfferPayload,
  ClaimOfferAttributeListProps,
  ClaimOfferState,
  ClaimPaidOfferState,
  ClaimProofNavigation,
  TokenFeesData,
} from '../../claim-offer/type-claim-offer'

import { ModalHeader } from './modal-header'
import { ModalContent } from './modal-content'
import { ModalButtons } from '../../components/buttons/modal-buttons'
import { newConnectionSeen } from '../../connection-history/connection-history-store'
import { measurements } from '../../../app/common/styles/measurements'
import { LedgerFees } from '../../ledger/components/ledger-fees/ledger-fees'
import PaymentTransactionInfo from '../../claim-offer/components/payment-transaction-info'
import CredentialCostInfo from '../../claim-offer/components/credential-cost-info'

import {
  getConnectionLogoUrl,
  getConnectionTheme,
  getThereIsANewAgreement,
  getAlreadySignedAgreement,
} from '../../store/store-selector'
import {
  claimOfferShown,
  acceptClaimOffer,
  claimOfferRejected,
  claimOfferIgnored,
  claimOfferShowStart,
  resetClaimRequestStatus,
} from '../../claim-offer/claim-offer-store'
import { updateStatusBarTheme } from '../../../app/store/connections-store'
import { withStatusBar } from '../../components/status-bar/status-bar'
import {
  black,
  mediumGray,
  matterhornSecondary,
  cardBorder,
} from '../../common/styles'
import { txnAuthorAgreementRoute, restoreWaitRoute } from '../../common'

let ScreenHeight = Dimensions.get('window').height
let ScreenWidth = Dimensions.get('window').width

class ClaimOfferModal extends React.Component<any, any> {
  constructor(props: any) {
    super(props)
    this.state = {
      moveMoreOptions: new Animated.Value(ScreenWidth),
      fadeInOut: new Animated.Value(0),
      moveModal: new Animated.Value(ScreenHeight),
      moveModalHeight: new Animated.Value(ScreenHeight),
      positionValue: new Animated.Value(0),
      offerStatus: 'IDLE',
      shouldShowTransactionInfo: false,
      restartTransaction: false,
      isAcceptedClaim: false,
    }
  }

  static defaultProps = {
    runAnimation: true,
  }

  componentDidMount = () => {
    if (
      (!this.props.alreadySignedAgreement || this.props.thereIsANewAgreement) &&
      parseFloat(this.props.claimPrice) > 0
    ) {
      this.props.navigation.navigate(txnAuthorAgreementRoute)
    }
  }

  agree = () => {
    this.props.navigation.navigate(txnAuthorAgreementRoute)
  }

  onIgnore = () => {
    this.props.newConnectionSeen(this.props.claimOfferData.issuer.did)
    this.hideModal()
    this.setState(() => this.props.claimOfferIgnored(this.props.uid))
  }

  onClose = () => {
    this.hideModal()
  }

  onAccept = (accepted: boolean) => {
    const { shouldShowTransactionInfo } = this.state
    const { claimOfferData } = this.props
    const { payTokenValue }: ClaimOfferPayload = claimOfferData
    if (!payTokenValue) {
      this.onConfirmAndPay(true)
      return
    }

    this.props.newConnectionSeen(this.props.claimOfferData.issuer.did)

    if (shouldShowTransactionInfo === false) {
      if (typeof accepted === 'boolean' && accepted) {
        this.onConfirmAndPay()
        return
      }
      this.setState({ shouldShowTransactionInfo: true })
      return
    }

    if (accepted) {
      this.props.acceptClaimOffer(this.props.uid)
    }
  }

  onTryAgain = () => {
    this.setState({ restartTransaction: true })
  }

  handleScroll = (event: any) => {
    if (event.nativeEvent.contentOffset.y < -100) {
      this.props.updatePosition(event.nativeEvent.contentOffset.y)
      this.hideModal()
    }
  }

  updatePosition = value => {
    Animated.timing(this.state.positionValue, {
      toValue: value,
      duration: 1,
      useNativeDriver: true,
    }).start()
  }

  moreOptionsClose = () => {
    Animated.timing(this.state.moveMoreOptions, {
      toValue: ScreenWidth,
      duration: 1,
      useNativeDriver: true,
    }).start()
  }

  moreOptionsOpen = () => {
    Animated.timing(this.state.moveMoreOptions, {
      toValue: 0,
      duration: 1,
      useNativeDriver: true,
    }).start()
  }

  showModal = () => {
    if (this.props.runAnimation) {
      Animated.parallel([
        Animated.timing(this.state.moveModal, {
          toValue: 0,
          duration: 1,
          useNativeDriver: true,
        }),
        Animated.timing(this.state.fadeInOut, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(this.state.moveModalHeight, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }

  hideModal = () => {
    this.props.navigation.goBack(null)
  }

  render() {
    this.showModal()

    const {
      claimOfferData,
      isValid,
      logoUrl,
      claimThemePrimary,
      claimThemeSecondary,
    } = this.props
    const {
      claimRequestStatus,
      issuer,
      data,
      payTokenValue,
    }: ClaimOfferPayload = claimOfferData

    const {
      offerStatus,
      shouldShowTransactionInfo,
      restartTransaction,
      isAcceptedClaim,
    } = this.state

    const testID = 'claim-offer'
    let acceptButtonText = payTokenValue ? 'Accept & Pay' : 'Accept'
    const hasNotAcceptedTAA =
      (!this.props.alreadySignedAgreement || this.props.thereIsANewAgreement) &&
      parseFloat(this.props.claimPrice) > 0

    return (
      <Animated.View style={[styles.outerAnimatedWrapper]}>
        <Animated.View style={[styles.innerAnimatedWrapper]}>
          <View>
            <TouchableOpacity style={styles.touchable} onPress={this.hideModal}>
              <View style={styles.helperWrapper} />
            </TouchableOpacity>
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
              {shouldShowTransactionInfo === false && (
                <ModalContent
                  content={this.props.claimOfferData.data.revealedAttributes}
                />
              )}

              {hasNotAcceptedTAA &&
                shouldShowTransactionInfo === false && (
                  <ModalButtons
                    onPress={this.agree}
                    onIgnore={this.onIgnore}
                    colorBackground={this.props.claimThemePrimary}
                    secondColorBackground={this.props.claimThemeSecondary}
                    leftBtnText={'Close'}
                    rightBtnText={'Read and Sign TAA'}
                  />
                )}

              {this.loadFees(
                payTokenValue,
                shouldShowTransactionInfo && hasNotAcceptedTAA === false
              )}

              {shouldShowTransactionInfo === false &&
                isAcceptedClaim === false &&
                hasNotAcceptedTAA === false && (
                  <ModalButtons
                    onPress={this.onAccept}
                    onIgnore={this.onIgnore}
                    colorBackground={this.props.claimThemePrimary}
                    secondColorBackground={this.props.claimThemeSecondary}
                    leftBtnText={'Ignore'}
                    rightBtnText={acceptButtonText}
                    primaryActionValue={true}
                    buttonsWrapperStyles={{
                      borderTopLeftRadius: 0,
                      borderTopRightRadius: 0,
                    }}
                  >
                    <CredentialPriceInfo price={payTokenValue || ''} />
                  </ModalButtons>
                )}
              {this.tokenTransactionStatus(claimRequestStatus)}
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    )
  }

  loadFees = (payTokenValue, shouldLoadFees) => {
    const { isAcceptedClaim } = this.state
    if (payTokenValue === null && shouldLoadFees) {
      if (!isAcceptedClaim) {
        this.setState({ isAcceptedClaim: true })
        this.onConfirmAndPay(true)
      }
      return null
    }
    return (
      shouldLoadFees && (
        <LedgerFees
          onStateChange={(state, data) => {
            this.updateState(state, data)
          }}
          transferAmount={payTokenValue}
        />
      )
    )
  }

  tokenTransactionStatus = status => {
    const { isAcceptedClaim } = this.state

    switch (status) {
      case 'SEND_CLAIM_REQUEST_SUCCESS':
      case 'CLAIM_REQUEST_SUCCESS':
        status = 'SUCCESS'
        break

      case 'INSUFFICIENT_BALANCE':
        status = 'INSUFFICIENT_BALANCE'
        break

      case 'SENDING_PAID_CREDENTIAL_REQUEST':
      case 'SENDING_CLAIM_REQUEST':
        status = 'SENDING_PAID_CREDENTIAL_REQUEST'
        break

      case 'NONE':
        return null

      default:
        if (!isAcceptedClaim) {
          return null
        }
    }

    return (
      <View>
        <PaymentTransactionInfo
          status={status}
          shouldShow
          backgroundColor={this.props.claimThemePrimary}
        >
          {this.renderFeesActionButtons(status)}
        </PaymentTransactionInfo>
      </View>
    )
  }

  updateState = (status: string, feesData?: TokenFeesData) => {
    let shouldShowTransactionInfo = false
    const feesDataSet = feesData || {
      fees: '0',
      total: '',
      currentTokenBalance: '',
    }

    const claimStatus =
      this.props.claimOfferData && this.props.claimOfferData.status
    const claimRequestStatus = this.props.claimOfferData.claimRequestStatus

    switch (status) {
      case 'ZERO_FEES':
      case 'TRANSFER':
        shouldShowTransactionInfo = true
        if (claimStatus !== 'ACCEPTED' && claimRequestStatus === 'NONE') {
          this.onAccept(true)
        }
        break

      case 'POSSIBLE':
        const { claimOfferData } = this.props
        const { payTokenValue }: ClaimOfferPayload = claimOfferData
        return (
          status && (
            <CredentialCostInfo
              feesData={feesDataSet}
              payTokenValue={payTokenValue || '0'}
              backgroundColor={this.props.claimThemePrimary}
              onConfirmAndPay={this.onConfirmAndPay}
              onCancel={this.onClose}
            />
          )
        )

      default:
        shouldShowTransactionInfo = true
        break
    }

    return (
      status && (
        <View>
          <PaymentTransactionInfo
            status={status}
            feesData={feesData}
            shouldShow={shouldShowTransactionInfo}
            backgroundColor={this.props.claimThemePrimary}
          >
            {this.renderFeesActionButtons(status)}
          </PaymentTransactionInfo>
        </View>
      )
    )
  }
  renderFeesActionButtons = status => {
    let mainButtonAction = this.onAccept
    let rightBtnText = 'Close'

    switch (status) {
      case 'ERROR':
        rightBtnText = 'Try again'
        mainButtonAction = this.onTryAgain
        break

      case 'IN_PROGRESS':
      case 'SENDING_PAID_CREDENTIAL_REQUEST':
      case 'SENDING_CLAIM_REQUEST':
        return null
      case 'SUCCESS':
      case 'NOT_POSSIBLE':
      case 'INSUFFICIENT_BALANCE':
      case 'SEND_CLAIM_REQUEST_SUCCESS':
      case 'CLAIM_REQUEST_SUCCESS':
        mainButtonAction = this.onClose
        break
      default:
        break
    }
    return (
      <ModalButtons
        onPress={mainButtonAction}
        colorBackground={this.props.claimThemePrimary}
        secondColorBackground={this.props.claimThemeSecondary}
        rightBtnText={rightBtnText}
      />
    )
  }

  onConfirmAndPay = (shouldHideModal = false) => {
    this.setState({ isAcceptedClaim: true })
    this.props.acceptClaimOffer(this.props.uid)
    if (shouldHideModal) {
      this.hideModal()
    }
  }
}

const mapStateToProps = (
  state: Store,
  { navigation: { state: { params } } }: ClaimProofNavigation
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

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      claimOfferShown,
      acceptClaimOffer,
      claimOfferRejected,
      claimOfferIgnored,
      updateStatusBarTheme,
      claimOfferShowStart,
      resetClaimRequestStatus,
      newConnectionSeen,
    },
    dispatch
  )

export default withStatusBar({ color: black })(
  connect(mapStateToProps, mapDispatchToProps)(ClaimOfferModal)
)

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: cardBorder,
    width: '90%',
    marginLeft: '5%',
    paddingTop: 12,
    position: 'relative',
  },
  innerAnimatedWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerAnimatedWrapper: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: ScreenWidth,
    height: ScreenHeight,
    position: 'absolute',
    zIndex: 999,
    elevation: 20,
  },
  modalWrapper: {
    backgroundColor: 'white',
    width: '100%',
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    height: measurements.WINDOW_HEIGHT * 0.85,
  },
  touchable: {
    height: measurements.WINDOW_HEIGHT * 0.15,
    justifyContent: 'flex-end',
  },
  helperWrapper: {
    backgroundColor: 'white',
    width: '15%',
    height: 6,
    borderRadius: 3,
    marginBottom: 7,
    alignSelf: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: mediumGray,
    width: '100%',
    textAlign: 'left',
    marginBottom: 2,
    fontFamily: 'Lato',
  },
  content: {
    fontSize: 17,
    fontWeight: '400',
    color: matterhornSecondary,
    width: '100%',
    textAlign: 'left',
    fontFamily: 'Lato',
    paddingBottom: 12,
  },
})
