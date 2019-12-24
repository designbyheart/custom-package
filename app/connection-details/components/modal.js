// @flow
import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { withNavigation } from 'react-navigation'
import { ModalHeader } from './modal-header'
import { ModalContent } from './modal-content'
import { ModalButtons } from '../../components/buttons/modal-buttons'
import { ModalButton } from '../../components/connection-details/modal-button'
import ModalContentProof from './modal-content-proof'
import { measurements } from '../../../app/common/styles/measurements'
import {
  acceptClaimOffer,
  claimOfferIgnored,
} from '../../claim-offer/claim-offer-store'
import { withBottomUpSliderScreen } from '../../components/bottom-up-slider-screen/bottom-up-slider-screen'
import { modalScreenRoute } from '../../common/route-constants'

// TODO: Fix the <any, {}> to be the correct types for props and state
class Modal extends Component<any, any> {
  constructor(props: any) {
    super(props)
    this.onAccept = this.onAccept.bind(this)
  }

  hideModal = () => {
    this.props.navigation.goBack(null)
  }

  onIgnore = () => {
    this.props.claimOfferIgnored(
      this.props.data.originalPayload.payloadInfo.uid
    )
    this.hideModal()
  }

  onClose = () => {
    this.hideModal()
  }

  onAccept = () => {
    this.props.acceptClaimOffer(this.props.data.originalPayload.payloadInfo.uid)
    this.hideModal()
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
    return (
      <View style={styles.modalWrapper}>
        <ModalHeader
          institutialName={institutialName}
          credentialName={data.name}
          credentialText={this.renderText(data.action)}
          imageUrl={imageUrl}
          colorBackground={this.props.navigation.state.params.colorBackground}
        />
        {this.renderModalContent(data)}
        {this.renderButtons(data)}
      </View>
    )
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      acceptClaimOffer,
      claimOfferIgnored,
    },
    dispatch
  )

export default withBottomUpSliderScreen(
  { routeName: modalScreenRoute },
  withNavigation(connect(null, mapDispatchToProps)(Modal))
)

const styles = StyleSheet.create({
  modalWrapper: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    height: measurements.WINDOW_HEIGHT * 0.85,
  },
})
