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

import type { ReactNavigation } from '../../common/type-common'
import type { Store } from '../../store/type-store'
import type {
  ClaimOfferProps,
  ClaimOfferPayload,
  ClaimOfferAttributeListProps,
  ClaimOfferState,
  ClaimProofNavigation,
} from '../../claim-offer/type-claim-offer'

import { CustomListProofRequest } from '../../components'
import { ModalHeader } from './modal-header'
import { ModalContent } from './modal-content'
import { ModalButtons } from '../../components/buttons/modal-buttons'
import { ModalButton } from '../../components/connection-details/modal-button'
import { measurements } from '../../../app/common/styles/measurements'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import ModalContentProof from './modal-content-proof'
import {
  getConnectionLogoUrl,
  getConnectionTheme,
  getUserAvatarSource,
} from '../../store/store-selector'
import {
  rejectProofRequest,
  acceptProofRequest,
  ignoreProofRequest,
  proofRequestShown,
  proofRequestShowStart,
} from '../../proof-request/proof-request-store'
import { newConnectionSeen } from '../../connection-history/connection-history-store'
import { updateStatusBarTheme } from '../../../app/store/connections-store'
import { withStatusBar } from '../../components/status-bar/status-bar'
import { black } from '../../common/styles'

let ScreenHeight = Dimensions.get('window').height
let ScreenWidth = Dimensions.get('window').width
class ProofRequestModal extends React.Component<any, any> {
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

  onIgnore = () => {
    this.hideModal()
    this.setState(() => this.props.claimOfferIgnored(this.props.uid))
  }
  onClose = () => {
    this.hideModal()
  }

  onAccept = () => {
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
  hideModal = () => {
    this.props.navigation.goBack(null)
  }

  render() {
    this.showModal()
    const { data, claimMap } = this.props.navigation.state.params

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
            { transform: [{ translateY: this.state.moveModal }] },
          ]}
        >
          <View>
            <TouchableOpacity style={styles.touchable} onPress={this.hideModal}>
              <View style={styles.helperWrapper} />
            </TouchableOpacity>
            <View style={styles.modalWrapper}>
              <ModalHeader
                institutialName={this.props.name}
                credentialName={this.props.data.name}
                credentialText={'You shared this information'}
                imageUrl={this.props.logoUrl}
                colorBackground={this.props.claimThemePrimary}
              />
              <View style={styles.outerModalWrapper}>
                <View style={styles.innerModalWrapper}>
                  <CustomListProofRequest items={data} claimMap={claimMap} />
                </View>
              </View>

              <ModalButton
                onClose={() => this.onClose()}
                colorBackground={this.props.claimThemePrimary}
              />
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    )
  }
}

const mapStateToProps = (state: Store, props: ClaimProofNavigation) => {
  const { proofRequest } = state
  const { uid } = props.navigation.state.params
  const proofRequestData = proofRequest[uid] || {}
  const {
    data,
    requester = {},
    proofStatus,
    remotePairwiseDID,
    missingAttributes = {},
  } = proofRequestData
  const { name } = requester

  const logoUrl = getConnectionLogoUrl(state, remotePairwiseDID)

  const themeForLogo = getConnectionTheme(state, logoUrl)
  const isValid = proofRequestData && data && data.requestedAttributes
  const proofGenerationError = state.proof[uid] ? state.proof[uid].error : null
  const errorProofSendData =
    state.proof[uid] && state.proof[uid].proofData
      ? state.proof[uid].proofData.error
      : null

  return {
    claimThemePrimary: themeForLogo.primary,
    claimThemeSecondary: themeForLogo.secondary,
    isValid,
    data,
    logoUrl,
    name,
    uid,
    proofStatus,
    proofGenerationError,
    claimMap: state.claim.claimMap,
    missingAttributes,
    userAvatarSource: getUserAvatarSource(state.user.avatarName),
    errorProofSendData,
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      newConnectionSeen,
    },
    dispatch
  )

export default withStatusBar({ color: black })(
  connect(mapStateToProps, mapDispatchToProps)(ProofRequestModal)
)

const styles = StyleSheet.create({
  outerAnimatedWrapper: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: ScreenWidth,
    height: ScreenHeight,
    position: 'absolute',
    zIndex: 999,
    elevation: 20,
  },
  innerAnimatedWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
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
  modalWrapper: {
    backgroundColor: 'white',
    width: '100%',
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    height: measurements.WINDOW_HEIGHT * 0.85,
  },
  outerModalWrapper: {
    width: '100%',
    flex: 1,
  },
  innerModalWrapper: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    paddingTop: 5,
  },
})
