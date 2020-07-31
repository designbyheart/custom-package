// @flow
import React, { useCallback } from 'react'
import { View, StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { useNavigation } from '@react-navigation/native'

import type {
  ReactNavigation,
  ReduxConnect,
  GenericObject,
} from '../../common/type-common'

import { ModalHeader } from './modal-header'
import { ModalContent } from './modal-content'
import { ModalButtons } from '../../components/buttons/modal-buttons'
import { ModalButton } from '../../components/connection-details/modal-button'
import ModalContentProof from './modal-content-proof'
import {
  acceptClaimOffer,
  claimOfferIgnored,
} from '../../claim-offer/claim-offer-store'
import { modalScreenRoute } from '../../common/route-constants'

type CredentialReceivedProps = {
  route: {
    params: {
      colorBackground: string,
      institutionalName: string,
      imageUrl: string,
      secondColorBackground: string,
      data: any, // TODO Add type from ConnectionHistoryEvent, make this type as Generic
    },
  },
} & ReduxConnect

const Modal = (props: CredentialReceivedProps) => {
  const {
    colorBackground,
    institutionalName,
    imageUrl,
    secondColorBackground,
  } = props.route.params
  const navigation = useNavigation()
  const hideModal = useCallback(() => {
    navigation.goBack(null)
  }, [])

  const { data } = props.route.params
  if (data.action !== 'RECEIVED') {
    return null
  }

  return (
    <View style={styles.modalWrapper}>
      <ModalHeader
        institutionalName={institutionalName}
        credentialName={data.name}
        credentialText="Accepted Credential"
        imageUrl={imageUrl}
        colorBackground={props.route.params.colorBackground}
      />
      <ModalContent
        content={data.data}
        imageUrl={imageUrl}
        uid={data.originalPayload.messageId}
        remotePairwiseDID={data.remoteDid}
      />
      <ModalButton
        onClose={hideModal}
        colorBackground={props.route.params.colorBackground}
      />
    </View>
  )
}

export const fulfilledMessageScreen = {
  routeName: modalScreenRoute,
  screen: connect()(Modal),
}

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
  },
})
