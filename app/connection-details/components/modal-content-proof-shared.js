// @flow
import React, { Component, useCallback } from 'react'
import { View, StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import type { Store } from '../../store/type-store'
import type { ClaimProofNavigation } from '../../claim-offer/type-claim-offer'

import { CustomListProofRequest } from '../../components'
import { ModalHeader } from './modal-header'
import { ModalButton } from '../../components/connection-details/modal-button'
import {
  getConnectionLogoUrl,
  getConnectionTheme,
} from '../../store/store-selector'
import { newConnectionSeen } from '../../connection-history/connection-history-store'
import { modalContentProofShared } from '../../common/route-constants'
import { scale, verticalScale, moderateScale } from 'react-native-size-matters'
import { colors, fontSizes, fontFamily } from '../../common/styles/constant'

// TODO: Fix any type
const ProofRequestModal = (props: any) => {
  const hideModal = useCallback(() => {
    props.navigation.goBack(null)
  }, [])

  const { data, claimMap } = props.route.params

  return (
    <View style={styles.modalWrapper}>
      <ModalHeader
        institutionalName={props.name}
        credentialName={props.data.name}
        credentialText={'You shared this information'}
        imageUrl={props.logoUrl}
        colorBackground={props.claimThemePrimary}
      />
      <View style={styles.outerModalWrapper}>
        <View style={styles.innerModalWrapper}>
          <CustomListProofRequest items={data} claimMap={claimMap} />
        </View>
      </View>
      <ModalButton
        onClose={hideModal}
        colorBackground={props.claimThemePrimary}
      />
    </View>
  )
}

const mapStateToProps = (state: Store, props: ClaimProofNavigation) => {
  const { proofRequest } = state
  const { uid } = props.route.params
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

export const proofScreen = {
  routeName: modalContentProofShared,
  screen: connect(mapStateToProps, null)(ProofRequestModal),
}

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
  },
  outerModalWrapper: {
    width: '100%',
    flex: 1,
  },
  innerModalWrapper: {
    flex: 1,
    backgroundColor: colors.cmGray5,
    paddingTop: moderateScale(5),
  },
})
