// @flow
import React, { Component } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { connect } from 'react-redux'
import { getConnections } from '../../store/connections-store'
import { primaryHeaderHeight } from '../../common/styles/constant'

import type { Store } from '../../store/type-store'
import type { UnreadMessagesBadgeProps } from './type-unread-messages-badge'
import type { Connection } from '../../store/type-connection-store'

const { width } = Dimensions.get('screen')
const marginTop = primaryHeaderHeight - 47

export class UnreadMessagesBadge extends Component<
  UnreadMessagesBadgeProps,
  void
> {
  render() {
    if (this.props.customContainerStyle) {
      return (
        <View
          style={
            this.props.numberOfNewMessages > 0
              ? this.props.customContainerStyle
              : styles.homeContainerNoMessages
          }
        >
          <Text style={styles.numberText}>
            {this.props.numberOfNewMessages}
          </Text>
        </View>
      )
    }
    return (
      <View
        style={
          this.props.numberOfNewMessages > 0
            ? [
                this.props.absolutePosition
                  ? styles.containerAbsolute
                  : styles.container,
              ]
            : [
                this.props.absolutePosition
                  ? styles.containerAbsoluteZeroMessages
                  : styles.containerZeroMessages,
              ]
        }
      >
        <Text style={styles.numberText}>
          {this.props.numberOfNewMessages > 9
            ? '9+'
            : this.props.numberOfNewMessages}
        </Text>
      </View>
    )
  }
}

const mapStateToProps = (state: Store) => {
  const receivedConnections: Connection[] = (getConnections(
    state.connections.data
  ): any)

  const customFlat = (array: Array<Array<Object>>) => [].concat(...array)

  const isNewConnection = (status: string) => {
    if (
      status === 'CLAIM OFFER RECEIVED' ||
      status === 'PROOF RECEIVED' ||
      status === 'QUESTION_RECEIVED'
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
  flattenPlaceholderArray.map(message => {
    if (isNewConnection(message.status)) numberOfNewMessages++
  })

  return {
    numberOfNewMessages,
  }
}

export default connect(mapStateToProps, null)(UnreadMessagesBadge)

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#86B93B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: width * 0.2,
    marginTop: marginTop + 5,
    marginLeft: 5,
  },
  homeContainerNoMessages: {
    width: 0,
    height: 0,
  },
  containerAbsolute: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#86B93B',
    alignItems: 'center',
    justifyContent: 'center',
    top: marginTop,
    left: width * 0.1 + 5,
    position: 'absolute',
  },
  containerAbsoluteZeroMessages: {
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    position: 'absolute',
  },
  containerZeroMessages: {
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: width * 0.2 + 24,
    marginTop: marginTop + 5,
    marginLeft: 5,
  },
  numberText: {
    fontFamily: 'Lato',
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
  },
})
