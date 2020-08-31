// @flow
import React, { useCallback } from 'react'
import { View, StyleSheet } from 'react-native'

import type { Store } from '../../store/type-store'
import type { ClaimProofNavigation } from '../../claim-offer/type-claim-offer'

import { ModalHeader } from './modal-header'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import ModalContentProof from './modal-content-proof'
import {
  getConnectionLogoUrl,
  getConnectionTheme,
  getUserAvatarSource,
} from '../../store/store-selector'
import { proofRequestRoute } from '../../common/route-constants'
import { newConnectionSeen } from '../../connection-history/connection-history-store'

// TODO: Fix any type
const ProofRequestModal = (props: any) => {
  const hideModal = useCallback(() => {
    const backRedirectRoute = props.backRedirectRoute
    if (backRedirectRoute) {
      props.navigation.navigate(backRedirectRoute)
    } else {
      props.navigation.goBack(null)
    }
  }, [])

  return (
    props && props.data ?
      <View style={styles.modalWrapper}>
        <ModalHeader
          institutionalName={props.name}
          credentialName={props.data.name}
          credentialText={'Wants you to fill out a form:'}
          imageUrl={props.logoUrl}
          colorBackground={props.claimThemePrimary}
        />
        <ModalContentProof
          content={props.data.requestedAttributes}
          uid={props.uid}
          invitationPayload={props.invitationPayload}
          attachedRequest={props.attachedRequest}
          colorBackground={props.claimThemePrimary}
          secondColorBackground={props.claimThemeSecondary}
          hideModal={hideModal}
          newConnectionSeen={props.newConnectionSeen}
        />
      </View> :
      <View/>
  )
}

const mapStateToProps = (state: Store, props: ClaimProofNavigation) => {
  const { proofRequest } = state

  const { uid, invitationPayload, attachedRequest, backRedirectRoute } = props.route.params
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
    invitationPayload,
    attachedRequest,
    backRedirectRoute,
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      newConnectionSeen,
    },
    dispatch
  )

export const proofRequestScreen = {
  routeName: proofRequestRoute,
  screen: connect(mapStateToProps, mapDispatchToProps)(ProofRequestModal),
}

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
  },
})
