// @flow
import React, { PureComponent } from 'react'
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ModalHeader } from './modal-header'
import { ModalContent } from './modal-content'
import { ModalButtons } from '../../components/connection-details/modal-buttons'
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

import type {
  ClaimOfferProps,
  ClaimOfferPayload,
  ClaimOfferAttributeListProps,
  ClaimOfferState,
} from '../../claim-offer/type-claim-offer'

// TODO: Fix the <any, {}> to be the correct types for props and state
class Modal extends PureComponent<any, {}> {
  constructor(props: any) {
    super(props)
    this.state = {}
    this.onAccept = this.onAccept.bind(this)
  }

  handleScroll = event => {
    if (event.nativeEvent.contentOffset.y < -100) {
      this.props.updatePosition(event.nativeEvent.contentOffset.y)
      this.props.hideModal()
    }
  }
  onIgnore = () => {
    this.props.hideModal()
    this.setState(() =>
      this.props.claimOfferIgnored(
        this.props.data.originalPayload.payloadInfo.uid
      )
    )
  }
  onClose = () => {
    this.props.hideModal()
  }

  onAccept = () => {
    this.props.hideModal()
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
      case 'RECEIVED':
        return (
          <ModalContent
            content={this.props.data.data}
            imageUrl={this.props.imageUrl}
          />
        )
      case 'PROOF RECEIVED':
        return (
          <ModalContentProof
            content={this.props.data.data}
            uid={this.props.data.originalPayload.payloadInfo.uid}
            colorBackground={this.props.colorBackground}
            secondColorBackground={this.props.secondColorBackground}
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
            colorBackground={this.props.colorBackground}
            secondColorBackground={this.props.secondColorBackground}
            leftBtnText={'Ignore'}
            rightBtnText={'Accept'}
          />
        )
      case 'RECEIVED':
      case 'SHARED':
        return (
          <ModalButton
            onClose={() => this.onClose()}
            colorBackground={this.props.colorBackground}
          />
        )
      default:
    }
  }
  render() {
    const { imageUrl } = this.props

    return (
      <ScrollView
        onScrollEndDrag={this.handleScroll}
        scrollEventThrottle={15}
        bounces={false}
      >
        <TouchableOpacity
          style={styles.touchable}
          onPress={this.props.hideModal}
        >
          <View style={styles.helperWrapper} />
        </TouchableOpacity>
        <View style={styles.modalWrapper}>
          <ModalHeader
            institutialName={this.props.institutialName}
            credentialName={this.props.data.name}
            credentialText={this.renderText(this.props.data.action)}
            imageUrl={imageUrl}
            colorBackground={this.props.colorBackground}
          />
          {this.renderModalContent(this.props.data)}
          {this.renderButtons(this.props.data)}
        </View>
      </ScrollView>
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

export default connect(null, mapDispatchToProps)(Modal)

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
})
