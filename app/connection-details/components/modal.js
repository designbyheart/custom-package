// @flow
import React, { useCallback } from 'react'
import { View, StyleSheet, StatusBar } from 'react-native'
import { connect } from 'react-redux'
import { useNavigation } from '@react-navigation/native'

import type { ReduxConnect } from '../../common/type-common'
import { colors } from '../../common/styles/constant'

import { ModalContent } from './modal-content'
import { ModalButton } from '../../components/connection-details/modal-button'
import { modalScreenRoute } from '../../common/route-constants'
import { ModalHeaderBar } from '../../components/modal-header-bar/modal-header-bar'

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
  const { institutionalName, imageUrl } = props.route.params
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
      <StatusBar backgroundColor={colors.cmBlack} barStyle={'light-content'} />
      <ModalContent
        content={data.data}
        imageUrl={imageUrl}
        uid={data.originalPayload.messageId}
        remotePairwiseDID={data.remoteDid}
        institutionalName={institutionalName}
        credentialName={data.name}
        credentialText="Accepted Credential"
        colorBackground={props.route.params.colorBackground}
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

fulfilledMessageScreen.screen.navigationOptions = ({
  navigation: { goBack, isFocused },
}) => ({
  safeAreaInsets: { top: 85 },
  cardStyle: {
    marginLeft: '2.5%',
    marginRight: '2.5%',
    marginBottom: '4%',
    borderRadius: 10,
    backgroundColor: colors.cmWhite,
  },
  cardOverlay: () => (
    <ModalHeaderBar
      headerTitle={isFocused() ? 'My Credential' : ''}
      dismissIconType={isFocused() ? 'Arrow' : null}
      onPress={() => goBack(null)}
    />
  ),
})

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
  },
})
