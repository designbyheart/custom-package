// @flow
import React, { PureComponent } from 'react'
import SvgCustomIcon from '../../components/svg-custom-icon'
import { Avatar } from '../../components/avatar/avatar'
import {
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native'
import type {
  NotificationCardProps,
  NotificationCardState,
} from './type-notification-card'
import { mediumGray, color } from '../../common/styles/constant'
import {
  PanGestureHandler,
  State,
  RectButton,
} from 'react-native-gesture-handler'

class NotificationCard extends PureComponent<
  NotificationCardProps,
  NotificationCardState
> {
  state = {
    translateY: new Animated.Value(0),
  }

  componentDidMount() {
    this.showNotification()
  }

  onGestureEvent = Animated.event([
    {
      nativeEvent: {
        absoluteY: this.state.translateY,
      },
    },
  ])

  getInfoMessage = (
    status: string,
    senderName: string,
    credentialName: string,
    question: string
  ) => {
    const statusMsg = {
      'PROOF RECEIVED': senderName + ' wants you to share some information',
      QUESTION_RECEIVED: question,
      'CLAIM OFFER RECEIVED': 'Offering ' + credentialName,
    }

    return statusMsg[status]
  }

  showNotification = () => {
    Animated.timing(this.state.translateY, {
      toValue: 50,
      duration: 200,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(this.state.translateY, {
          toValue: -100,
          duration: 200,
        }).start(() => this.props.notificationCardSwipedUp())
      }, 4000)
    })
  }

  onHandlerStateChange = (event: Object) => {
    const { status } = this.props

    if (event.nativeEvent.oldState === State.ACTIVE) {
      Animated.timing(this.state.translateY, {
        toValue: -100,
        duration: 200,
      }).start(() => this.props.notificationCardSwipedUp())
    }
  }

  onCardPress = () => {
    Animated.timing(this.state.translateY, {
      toValue: -100,
      duration: 200,
    }).start(() => {
      this.props.notificationCardSwipedUp()
      this.props.onNotificationCardPress(
        this.props.senderName,
        this.props.image,
        this.props.senderDID
      )
    })
  }

  render() {
    const { image, senderName, credentialName, status, question } = this.props
    const {
      container,
      initialsContainer,
      initialsText,
      newCardContainer,
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
              top: this.state.translateY,
            },
          ]}
        >
          <View style={container}>
            <RectButton
              style={buttonContainer}
              onPress={() => this.onCardPress()}
            >
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
                      {this.getInfoMessage(
                        status,
                        senderName,
                        credentialName,
                        question
                      )}
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
}

export { NotificationCard }

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
  initialsContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: color.border.primary,
  },
  initialsText: {
    fontFamily: 'Lato',
    fontSize: 17,
    fontWeight: 'bold',
    color: color.textColor.darkgray,
  },
  newCardContainer: {
    backgroundColor: color.bg.sixteenth.color,
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
  dateSection: {
    width: '70%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  buttonSection: {
    height: '50%',
    width: '30%',
    justifyContent: 'flex-end',
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
  newButtonSection: {
    height: '100%',
    width: '30%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  newLabel: {
    width: 64,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.bg.twelfth.color,
    marginBottom: 5,
  },
  newLabelText: {
    fontFamily: 'Lato',
    fontSize: 11,
    fontWeight: '500',
    color: color.bg.primary.font.primary,
  },
})
