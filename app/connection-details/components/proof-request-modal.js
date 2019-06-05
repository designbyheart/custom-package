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
import { ModalHeader } from './modal-header'
import { ModalContent } from './modal-content'
import { ModalButtons } from '../../components/connection-details/modal-buttons'
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
import type { ReactNavigation } from '../../common/type-common'
import type { Store } from '../../store/type-store'
import {
  rejectProofRequest,
  acceptProofRequest,
  ignoreProofRequest,
  proofRequestShown,
  proofRequestShowStart,
} from '../../proof-request/proof-request-store'
import { updateStatusBarTheme } from '../../../app/store/connections-store'
import type {
  ClaimOfferProps,
  ClaimOfferPayload,
  ClaimOfferAttributeListProps,
  ClaimOfferState,
} from '../../claim-offer/type-claim-offer'
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
          <ScrollView
            onScrollEndDrag={this.handleScroll}
            scrollEventThrottle={15}
            bounces={false}
          >
            <TouchableOpacity style={styles.touchable} onPress={this.hideModal}>
              <View style={styles.helperWrapper} />
            </TouchableOpacity>
            <View style={styles.modalWrapper}>
              <ModalHeader
                institutialName={this.props.name}
                credentialName={this.props.data.name}
                credentialText={'Wants you to fill out a form:'}
                imageUrl={this.props.logoUrl}
                colorBackground={this.props.claimThemePrimary}
              />
              <ModalContentProof
                content={this.props.data.requestedAttributes}
                uid={this.props.uid}
                colorBackground={this.props.claimThemePrimary}
                secondColorBackground={this.props.claimThemeSecondary}
                hideModal={() => this.onClose()}
              />
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    )
  }
}
const mapStateToProps = (state: Store, props: ReactNavigation) => {
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

export default connect(mapStateToProps, null)(ProofRequestModal)
const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#f2f2f2',
    width: '90%',
    marginLeft: '5%',
    paddingTop: 12,
    position: 'relative',
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
  outerAnimatedWrapper: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: ScreenWidth,
    height: ScreenHeight,
    position: 'absolute',
    // top: this.state.moveModal,
    // left: 0,
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
})
