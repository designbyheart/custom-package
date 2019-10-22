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

import type { ReactNavigation } from '../../common/type-common'
import type { Store } from '../../store/type-store'
import type {
  ClaimOfferProps,
  ClaimOfferPayload,
  ClaimOfferAttributeListProps,
  ClaimOfferState,
  ClaimProofNavigation,
} from '../../claim-offer/type-claim-offer'

import { ModalHeader } from './modal-header'
import { ModalContent } from './modal-content'
import { ModalButtons } from '../../components/connection-details/modal-buttons'
import { ModalButton } from '../../components/connection-details/modal-button'
import { newConnectionSeen } from '../../connection-history/connection-history-store'
import { measurements } from '../../../app/common/styles/measurements'
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
import { black } from '../../common/styles'
import { txnAuthorAgreementRoute } from '../../common'

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

  onAccept = () => {
    this.props.newConnectionSeen(this.props.claimOfferData.issuer.did)
    this.hideModal()

    this.setState(() => this.props.acceptClaimOffer(this.props.uid))
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

    const testID = 'claim-offer'
    let acceptButtonText = payTokenValue ? 'Accept & Pay' : 'Accept'
    const hasNotAcceptedTAA =
      (!this.props.alreadySignedAgreement || this.props.thereIsANewAgreement) &&
      parseFloat(this.props.claimPrice) > 0

    return (
      <Animated.View
        style={[
          styles.outerAnimatedWrapper,
          {
            transform: [{ translateY: this.state.moveModal }],
            opacity: this.state.fadeInOut,
          },
        ]}
      >
        <Animated.View
          style={{
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ translateY: this.state.moveModalHeight }],
          }}
          style={[
            styles.innerAnimatedWrapper,
            { transform: [{ translateY: this.state.moveModalHeight }] },
          ]}
        >
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
              <ModalContent
                content={this.props.claimOfferData.data.revealedAttributes}
              />
              {hasNotAcceptedTAA ? (
                <ModalButtons
                  onPress={() => this.agree()}
                  onIgnore={() => this.onIgnore()}
                  colorBackground={this.props.claimThemePrimary}
                  secondColorBackground={this.props.claimThemeSecondary}
                  leftBtnText={'Close'}
                  rightBtnText={'Read and Sign TAA'}
                />
              ) : (
                <ModalButtons
                  onPress={() => this.onAccept()}
                  onIgnore={() => this.onIgnore()}
                  colorBackground={this.props.claimThemePrimary}
                  secondColorBackground={this.props.claimThemeSecondary}
                  leftBtnText={'Ignore'}
                  rightBtnText={'Accept'}
                />
              )}
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    )
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
    backgroundColor: '#f2f2f2',
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
    color: '#a5a5a5',
    width: '100%',
    textAlign: 'left',
    marginBottom: 2,
    fontFamily: 'Lato',
  },
  content: {
    fontSize: 17,
    fontWeight: '400',
    color: '#505050',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'Lato',
    paddingBottom: 12,
  },
})
