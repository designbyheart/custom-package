// @flow

import React, { Component } from 'react'
import {
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native'
import {
  PanGestureHandler,
  State,
  RectButton,
} from 'react-native-gesture-handler'
import { connect } from 'react-redux'
import { withNavigation } from 'react-navigation'

import type { NotificationCardProps } from './in-app-notification-type'
import type { Store } from '../store/type-store'

import SvgCustomIcon from '../components/svg-custom-icon'
import { Avatar } from '../components/avatar/avatar'
import { mediumGray, color } from '../common/styles/constant'
import { scheduleClearInAppNotification } from './in-app-notification-actions'
import { connectionHistRoute } from '../common'

class NotificationCardComponent extends Component<NotificationCardProps, void> {
  translateY = new Animated.Value(0)

  onGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          absoluteY: this.translateY,
        },
      },
    ],
    {
      useNativeDriver: true,
    }
  )

  render() {
    const { notification } = this.props

    if (!notification) {
      return null
    }

    const { senderName, senderImage: image, text } = notification
    const {
      container,
      initialsContainer,
      initialsText,
      avatarSection,
      infoSection,
      companyNameSection,
      descriptionSection,
      companyNameText,
      descriptionText,
      infoSectionTopRow,
      infoSectionBottomRow,
      outerContainer,
      dateButtonSection,
      dateText,
      buttonContainer,
    } = styles

    return (
      <PanGestureHandler
        onGestureEvent={this.onGestureEvent}
        onHandlerStateChange={this.onHandlerStateChange}
      >
        <Animated.View
          style={[
            outerContainer,
            {
              transform: [
                {
                  translateY: this.translateY,
                },
              ],
            },
          ]}
        >
          <View style={container}>
            <RectButton style={buttonContainer} onPress={this.onCardPress}>
              <View style={avatarSection}>
                {typeof image === 'string' ? (
                  <Avatar radius={16} src={{ uri: image }} />
                ) : (
                  <View style={initialsContainer}>
                    <Text style={initialsText}>
                      {senderName ? senderName[0] : null}
                    </Text>
                  </View>
                )}
              </View>
              <View style={infoSection}>
                <View style={infoSectionTopRow}>
                  <View style={companyNameSection}>
                    <Text
                      style={companyNameText}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {senderName}
                    </Text>
                  </View>
                  <View style={dateButtonSection}>
                    <Text style={dateText}>{'Now'}</Text>
                  </View>
                </View>
                <View style={infoSectionBottomRow}>
                  <View style={descriptionSection}>
                    <Text
                      style={descriptionText}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {text}
                    </Text>
                  </View>
                </View>
              </View>
            </RectButton>
          </View>
        </Animated.View>
      </PanGestureHandler>
    )
  }

  componentDidUpdate(prevProps: NotificationCardProps) {
    if (prevProps.notification !== this.props.notification) {
      this.showNotification()
    }
  }

  componentDidMount() {
    this.hideNotification()
  }

  showNotification = () => {
    Animated.timing(this.translateY, {
      toValue: 50,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      this.props.dispatch(scheduleClearInAppNotification())
    })
  }

  hideNotification = () => {
    Animated.timing(this.translateY, {
      toValue: -100,
      duration: 150,
      useNativeDriver: true,
    }).start()
  }

  onCardPress = () => {
    this.hideNotification()

    const {
      senderName,
      senderImage: image,
      senderDID,
      messageType,
      messageId: uid,
      identifier,
    } = this.props.notification

    this.props.navigation.navigate(connectionHistRoute, {
      senderName,
      senderDID,
      identifier,
      image,
      uid,
      messageType,
      notificationOpenOptions: {
        openMessageDirectly: true,
      },
    })
  }

  onHandlerStateChange = (event: Object) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this.hideNotification()
    }
  }
}

const mapStateToProps = (state: Store) => ({
  notification: state.inAppNotification.notification,
})

export const NotificationCard = withNavigation(
  connect(mapStateToProps)(NotificationCardComponent)
)

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    zIndex: 1000,
    width: '100%',
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: Platform.OS === 'android' ? 9 : 0,
  },
  container: {
    width: 343,
    height: '100%',
    borderRadius: 10,
    flexDirection: 'row',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    backgroundColor: '#fff',
    elevation: Platform.OS === 'android' ? 9 : 0,
  },
  buttonContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    flexDirection: 'row',
  },
  avatarSection: {
    height: '100%',
    width: 64,
    paddingTop: 16,
    alignItems: 'center',
  },
  infoSection: {
    flex: 1,
  },
  infoSectionTopRow: {
    flex: 1,
    flexDirection: 'row',
    height: '50%',
  },
  infoSectionBottomRow: {
    flex: 1,
    height: '50%',
  },
  companyNameSection: {
    width: '80%',
    height: '100%',
    justifyContent: 'flex-end',
    paddingBottom: 5,
  },
  descriptionSection: {
    width: '96%',
    height: '100%',
  },
  dateButtonSection: {
    width: '20%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyNameText: {
    fontFamily: 'Lato',
    fontSize: 17,
    fontWeight: 'bold',
    color: color.textColor.darkgray,
  },
  descriptionText: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: color.textColor.grey,
  },
  dateText: {
    fontFamily: 'Lato',
    fontSize: 11,
    color: color.textColor.mediumGray,
    marginBottom: 5,
  },
})
