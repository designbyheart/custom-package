// @flow
import React, { PureComponent } from 'react'
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import type {
  ClaimOfferProps,
  ClaimOfferPayload,
  ClaimOfferAttributeListProps,
  ClaimOfferState,
} from '../../claim-offer/type-claim-offer'

import { ModalHeader } from './modal-header'
import { ModalContent } from './modal-content'
import { ModalButtons } from '../../components/buttons/modal-buttons'
import { ModalButton } from '../../components/connection-details/modal-button'
import ModalContentProof from './modal-content-proof'
import { measurements } from '../../../app/common/styles/measurements'
import {
  claimOfferShown,
  acceptClaimOffer,
  claimOfferRejected,
  claimOfferIgnored,
  claimOfferShowStart,
  resetClaimRequestStatus,
} from '../../claim-offer/claim-offer-store'
import { withStatusBar } from '../../components/status-bar/status-bar'
import { black } from '../../common/styles'

let ScreenHeight = Dimensions.get('window').height
let ScreenWidth = Dimensions.get('window').width

// TODO: Fix the <any, {}> to be the correct types for props and state
class Modal extends PureComponent<any, any> {
  constructor(props: any) {
    super(props)
    this.state = {
      moveMoreOptions: new Animated.Value(ScreenWidth),
      fadeInOut: new Animated.Value(0),
      moveModal: new Animated.Value(ScreenHeight),
      moveModalHeight: new Animated.Value(ScreenHeight),
      positionValue: new Animated.Value(0),
    }
    this.onAccept = this.onAccept.bind(this)
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

  onIgnore = () => {
    this.hideModal()
    this.setState(() =>
      this.props.claimOfferIgnored(
        this.props.data.originalPayload.payloadInfo.uid
      )
    )
  }
  onClose = () => {
    this.hideModal()
  }

  onAccept = () => {
    this.hideModal()
    this.setState(() =>
      this.props.acceptClaimOffer(
        this.props.data.originalPayload.payloadInfo.uid
      )
    )
  }
  renderText(param) {
    switch (param) {
      case 'CLAIM OFFER RECEIVED':
        return 'is offering to issue you'
      case 'RECEIVED':
        return 'Accepted Credential'
      case 'PROOF RECEIVED':
        return 'Wants you to fill out a form:'
      case 'SHARED':
        return 'You shared this information'
      default:
        return ''
    }
  }
  renderModalContent(data) {
    switch (data.action) {
      case 'CLAIM OFFER RECEIVED':
      case 'SHARED':
        return (
          <ModalContent
            content={data.data}
            imageUrl={data.imageUrl}
            showSidePicture={true}
          />
        )
      case 'RECEIVED':
        return <ModalContent content={data.data} imageUrl={data.imageUrl} />
      case 'PROOF RECEIVED':
        return (
          <ModalContentProof
            content={data.data}
            uid={data.originalPayload.payloadInfo.uid}
            colorBackground={this.props.navigation.state.params.colorBackground}
            secondColorBackground={
              this.props.navigation.state.params.secondColorBackground
            }
            hideModal={() => this.onClose()}
          />
        )
      default:
    }
  }
  renderButtons(param) {
    switch (param.action) {
      case 'CLAIM OFFER RECEIVED':
        return (
          <ModalButtons
            onPress={() => this.onAccept()}
            onIgnore={() => this.onIgnore()}
            colorBackground={this.props.navigation.state.params.colorBackground}
            secondColorBackground={
              this.props.navigation.state.params.secondColorBackground
            }
            leftBtnText={'Ignore'}
            rightBtnText={'Accept'}
          />
        )
      case 'RECEIVED':
      case 'SHARED':
        return (
          <ModalButton
            onClose={() => this.onClose()}
            colorBackground={this.props.navigation.state.params.colorBackground}
          />
        )
      default:
    }
  }
  render() {
    const {
      colorBackground,
      institutialName,
      imageUrl,
      secondColorBackground,
    } = this.props.navigation.state.params
    const { data } = this.props.navigation.state.params
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
          <View>
            <TouchableOpacity
              style={styles.touchable}
              onPress={this.props.hideModal}
            >
              <View style={styles.helperWrapper} />
            </TouchableOpacity>
            <View style={styles.modalWrapper}>
              <ModalHeader
                institutialName={institutialName}
                credentialName={data.name}
                credentialText={this.renderText(data.action)}
                imageUrl={imageUrl}
                colorBackground={
                  this.props.navigation.state.params.colorBackground
                }
              />
              {this.renderModalContent(data)}
              {this.renderButtons(data)}
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    )
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      claimOfferShown,
      acceptClaimOffer,
      claimOfferRejected,
      claimOfferIgnored,
      claimOfferShowStart,
      resetClaimRequestStatus,
    },
    dispatch
  )

export default withStatusBar({ color: black })(
  connect(null, mapDispatchToProps)(Modal)
)

const styles = StyleSheet.create({
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
})
