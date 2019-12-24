// @flow
import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import { withNavigation } from 'react-navigation'
import type { Store } from '../../store/type-store'
import type { ClaimProofNavigation } from '../../claim-offer/type-claim-offer'
import { CustomListProofRequest } from '../../components'
import { ModalHeader } from './modal-header'
import { ModalButton } from '../../components/connection-details/modal-button'
import { measurements } from '../../../app/common/styles/measurements'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  getConnectionLogoUrl,
  getConnectionTheme,
} from '../../store/store-selector'
import { newConnectionSeen } from '../../connection-history/connection-history-store'
import { modalContentProofShared } from '../../common/route-constants'
import { withBottomUpSliderScreen } from '../../components/bottom-up-slider-screen/bottom-up-slider-screen'

class ProofRequestModal extends Component<any, any> {
  hideModal = () => {
    this.props.navigation.goBack(null)
  }

  render() {
    const { data, claimMap } = this.props.navigation.state.params

    return (
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
          onClose={this.hideModal}
          colorBackground={this.props.claimThemePrimary}
        />
      </View>
    )
  }
}

const mapStateToProps = (state: Store, props: ClaimProofNavigation) => {
  const { proofRequest } = state
  const { uid } = props.navigation.state.params
  const proofRequestData = proofRequest[uid] || {}
  const { data, requester = {}, remotePairwiseDID } = proofRequestData
  const { name } = requester
  const logoUrl = getConnectionLogoUrl(state, remotePairwiseDID)
  const themeForLogo = getConnectionTheme(state, logoUrl)

  return {
    claimThemePrimary: themeForLogo.primary,
    data,
    logoUrl,
    name,
    uid,
    claimMap: state.claim.claimMap,
  }
}

export default withBottomUpSliderScreen(
  { routeName: modalContentProofShared },
  withNavigation(connect(mapStateToProps, null)(ProofRequestModal))
)

const styles = StyleSheet.create({
  modalWrapper: {
    width: '100%',
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
