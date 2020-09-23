// @flow
import React, { useCallback } from 'react'
import { View, StyleSheet, StatusBar } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

// store
import type { Store } from '../../store/type-store'

import {
  getConnectionLogoUrl,
  getConnectionTheme,
  getUserAvatarSource,
} from '../../store/store-selector'

// types
import type { ClaimProofNavigation } from '../../claim-offer/type-claim-offer'

// constants
import { proofRequestRoute } from '../../common/route-constants'

// components
import ModalContentProof from './modal-content-proof'
import { ModalHeaderBar } from '../../components/modal-header-bar/modal-header-bar'
import { newConnectionSeen } from '../../connection-history/connection-history-store'

// styles
import { colors } from '../../common/styles/constant'

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

  return props && props.data ? (
    <View style={styles.modalWrapper}>
      <StatusBar backgroundColor={colors.cmBlack} barStyle={'light-content'} />
      <ModalContentProof
        content={props.data.requestedAttributes}
        uid={props.uid}
        invitationPayload={props.invitationPayload}
        attachedRequest={props.attachedRequest}
        colorBackground={props.claimThemePrimary}
        secondColorBackground={props.claimThemeSecondary}
        hideModal={hideModal}
        newConnectionSeen={props.newConnectionSeen}
        institutionalName={props.name}
        credentialName={props.data.name}
        credentialText={'Requested by'}
        imageUrl={props.logoUrl}
        navigation={props.navigation}
        route={props.route}
      />
    </View>
  ) : (
    <View />
  )
}

const mapStateToProps = (state: Store, props: ClaimProofNavigation) => {
  const { proofRequest } = state

  const {
    uid,
    invitationPayload,
    attachedRequest,
    backRedirectRoute,
  } = props.route.params
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

proofRequestScreen.screen.navigationOptions = ({
  navigation: { goBack, isFocused },
}) => ({
  safeAreaInsets: { top: isFocused() ? 85 : 100 },
  cardStyle: {
    marginLeft: '2.5%',
    marginRight: '2.5%',
    marginBottom: '4%',
    borderRadius: 10,
    backgroundColor: colors.cmWhite,
  },
  cardOverlay: () => {
    return (
      <ModalHeaderBar
        headerTitle={isFocused() ? 'Proof Request' : ''}
        dismissIconType={isFocused() ? 'CloseIcon' : null}
        onPress={() => goBack(null)}
      />
    )
  },
})

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
  },
})
