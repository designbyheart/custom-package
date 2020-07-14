// @flow
import React, { Component } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { connect } from 'react-redux'
import { getConnections } from '../../store/connections-store'
import { colors, fontFamily, fontSizes } from '../../common/styles/constant'

import type { Store } from '../../store/type-store'
import type { UnreadMessagesBadgeProps } from './type-unread-messages-badge'
import type { Connection } from '../../store/type-connection-store'
import { scale, verticalScale, moderateScale } from 'react-native-size-matters'

import { HISTORY_EVENT_STATUS } from '../../connection-history/type-connection-history'

const { width } = Dimensions.get('screen')
const marginTop = verticalScale(90 - 42)

export const UnreadMessagesBadge = ({
  customContainerStyle,
  numberOfNewMessages = 0,
  absolutePosition,
}: UnreadMessagesBadgeProps) => {
  if (numberOfNewMessages <= 0) {
    return null
  }

  const containerStyle = customContainerStyle
    ? customContainerStyle
    : absolutePosition
    ? styles.containerAbsolute
    : styles.container

  return (
    <View style={containerStyle}>
      <Text style={styles.numberText}>
        {numberOfNewMessages > 9 ? '9+' : numberOfNewMessages}
      </Text>
    </View>
  )
}

const mapStateToProps = (state: Store) => {
  const receivedConnections: Connection[] = (getConnections(
    state.connections.data
  ): any)

  const customFlat = (array: Array<Array<Object>>) => [].concat(...array)

  const isNewConnection = (status: string) => {
    if (
      status === HISTORY_EVENT_STATUS.CLAIM_OFFER_RECEIVED ||
      status === HISTORY_EVENT_STATUS.PROOF_REQUEST_RECEIVED ||
      status === HISTORY_EVENT_STATUS.QUESTION_RECEIVED
    ) {
      return true
    } else return false
  }

  const placeholderArray = []
  const connections = receivedConnections.map((connection, index) => {
    placeholderArray.push(
      (state.history.data &&
        state.history.data.connections &&
        state.history.data.connections[connection.senderDID] &&
        state.history.data.connections[connection.senderDID].data) ||
        []
    )
  })

  const flattenPlaceholderArray = customFlat(placeholderArray)

  let numberOfNewMessages = 0
  flattenPlaceholderArray.map((message) => {
    if (isNewConnection(message.status)) numberOfNewMessages++
  })

  return {
    numberOfNewMessages,
  }
}

export default connect(mapStateToProps, null)(UnreadMessagesBadge)

export const unreadMessageContainerCommonStyle = {
  width: moderateScale(22),
  height: moderateScale(22),
  borderRadius: moderateScale(22) / 2,
  backgroundColor: colors.cmGreen1,
  alignItems: 'center',
  justifyContent: 'center',
}
const styles = StyleSheet.create({
  container: {
    ...unreadMessageContainerCommonStyle,
    marginTop: marginTop + 5,
    marginLeft: moderateScale(5),
  },
  containerAbsolute: {
    ...unreadMessageContainerCommonStyle,
    top: verticalScale(marginTop - 3),
    left: moderateScale(width * 0.1 + 5),
    position: 'absolute',
  },
  numberText: {
    fontFamily: fontFamily,
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: colors.cmWhite,
  },
})
