// @flow
import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import { withNavigation } from 'react-navigation'
import type { Store } from '../../store/type-store'
import type { ClaimProofNavigation } from '../../claim-offer/type-claim-offer'
import { ModalHeader } from './modal-header'
import { ModalContent } from './modal-content'
import { measurements } from '../../../app/common/styles/measurements'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import ModalContentProof from './modal-content-proof'
import {
  getConnectionLogoUrl,
  getConnectionTheme,
  getUserAvatarSource,
} from '../../store/store-selector'
import { proofRequestNewRoute } from '../../common/route-constants'
import { newConnectionSeen } from '../../connection-history/connection-history-store'
import { withBottomUpSliderScreen } from '../../components/bottom-up-slider-screen/bottom-up-slider-screen'

class ProofRequestModal extends Component<any, any> {
  onIgnore = () => {
    this.props.newConnectionSeen(this.props.claimOfferData.issuer.did)
    this.props.claimOfferIgnored(this.props.uid)
    this.hideModal()
  }

  onAccept = () => {
    this.props.newConnectionSeen(this.props.claimOfferData.issuer.did)
    this.props.acceptClaimOffer(this.props.uid)
    this.hideModal()
  }

  hideModal = () => {
    this.props.navigation.goBack(null)
  }

  render() {
    return (
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
          hideModal={this.hideModal}
          newConnectionSeen={this.props.newConnectionSeen}
        />
      </View>
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

export default withBottomUpSliderScreen(
  { routeName: proofRequestNewRoute },
  withNavigation(
    connect(mapStateToProps, mapDispatchToProps)(ProofRequestModal)
  )
)

const styles = StyleSheet.create({
  modalWrapper: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    height: measurements.WINDOW_HEIGHT * 0.85,
  },
})
