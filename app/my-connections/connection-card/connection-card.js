// @flow
import React, { PureComponent } from 'react'
import SvgCustomIcon from '../../components/svg-custom-icon'
import { Avatar } from '../../components/avatar/avatar'
import {
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native'
import type { ConnectionCardProps } from './type-connection-card'
import { styles } from './styles'
import { font, isiPhone5, mediumGray, recentCardSizes } from '../../common/styles/constant'
import { DefaultLogo } from '../../components/default-logo/default-logo'

class ConnectionCard extends PureComponent<ConnectionCardProps, void> {
  pad = (dateOrMonth: number) => {
    return dateOrMonth < 10 ? '0' + dateOrMonth : dateOrMonth
  }
  getCorrectDateLabel = (timestamp: string) => {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]
    const dayNames = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ]
    const currentDateTime = new Date()
    const dateTimeCreated = new Date(timestamp)
    const dateCreated = dateTimeCreated.getDate()
    const monthCreated = dateTimeCreated.getMonth()
    const yearCreated = dateTimeCreated.getFullYear()
    const hourCreated = dateTimeCreated.getHours()
    const minuteCreated = dateTimeCreated.getMinutes()
    const dayCreated = dateTimeCreated.getDay()
    const mmddyyyy =
      this.pad(monthCreated + 1) +
      '/' +
      this.pad(dateCreated) +
      '/' +
      yearCreated

    let hmm = ''
    if (hourCreated > 0 && hourCreated <= 12) {
      hmm += hourCreated
    } else if (hourCreated > 12) {
      hmm += hourCreated - 12
    } else if (hourCreated === 0) {
      hmm = '12'
    }

    hmm += minuteCreated < 10 ? ':0' + minuteCreated : ':' + minuteCreated
    hmm += hourCreated >= 12 ? ' PM' : ' AM'

    const dayOfWeek = dayNames[dayCreated]
    const fullTimeCreated = dateTimeCreated.getTime()
    const currentTime = currentDateTime.getTime()
    const oneDay = 24 * 60 * 60 * 1000
    const oneWeek = oneDay * 7
    if (currentTime - fullTimeCreated < oneDay) {
      return hmm
    } else if (
      currentTime - fullTimeCreated >= oneDay &&
      currentTime - fullTimeCreated < oneDay * 2
    ) {
      return 'Yesterday'
    } else if (
      currentTime - fullTimeCreated >= oneDay * 2 &&
      currentTime - fullTimeCreated <= oneWeek
    ) {
      return dayOfWeek
    } else if (currentTime - fullTimeCreated > oneWeek) {
      return mmddyyyy
    }
  }
  getInfoMessage = (
    status: string,
    senderName: string,
    credentialName: string,
    question: string
  ) => {
    const statusMsg = {
      PENDING:
        'You accepted ' +
        credentialName +
        '. They will issue it to you shortly.',
      CLAIM_OFFER_ACCEPTED: `Accepting ${credentialName} ...`,
      CONNECTED: 'You connected with ' + senderName + '.',
      RECEIVED: senderName + ' issued you ' + credentialName + '.',
      'ACCEPTED & SAVED': 'Accepted on',
      SHARED: 'You shared ' + credentialName + ' with ' + senderName,
      'PROOF RECEIVED': senderName + ' wants you to share some information',
      'CLAIM OFFER RECEIVED': 'Offering ' + credentialName,
      QUESTION_RECEIVED: question,
      UPDATE_QUESTION_ANSWER: question,
      DENY_PROOF_REQUEST_SUCCESS: `You rejected ${credentialName}`,
      DENY_PROOF_REQUEST: `Rejecting "${credentialName}"`,
      DENY_PROOF_REQUEST_FAIL: `Failed to reject "${credentialName}"`,
      SEND_CLAIM_REQUEST_FAIL: `Failed to accept ${credentialName}`,
      PAID_CREDENTIAL_REQUEST_FAIL: `Failed to accept "${credentialName}"`,
      ERROR_SEND_PROOF: `Failed to send "${credentialName}"`,
      UPDATE_ATTRIBUTE_CLAIM: `Sending "${credentialName}" ...`,
      DENY_CLAIM_OFFER: `Rejecting "${credentialName}"`,
      DENY_CLAIM_OFFER_SUCCESS: `You rejected ${credentialName}`,
      DENY_CLAIM_OFFER_FAIL: `Failed to reject "${credentialName}"`,
    }

    return statusMsg[status]
  }
  renderButtonSection = () => {
    const { newBadge, date } = this.props
    const {
      dateSection,
      dateText,
      buttonSection,
      dateButtonSection,
      newButtonSection,
      newLabel,
      newLabelText,
    } = styles

    if (!newBadge) {
      return (
        <View style={dateButtonSection}>
          <View style={dateSection}>
            <Text style={dateText}>{this.getCorrectDateLabel(date)}</Text>
          </View>
          <View style={buttonSection}>
            <SvgCustomIcon name="ChevronRight" fill={mediumGray} />
          </View>
        </View>
      )
    } else {
      return (
        <View style={newButtonSection}>
          <View style={newLabel}>
            <Text style={newLabelText}>NEW</Text>
          </View>
        </View>
      )
    }
  }

  onButtonPress = () => {
    this.props.onPress(
      this.props.senderName,
      this.props.image,
      this.props.senderDID
    )
    this.props.onNewConnectionSeen(this.props.senderDID)
  }

  render() {
    const {
      image,
      senderName,
      credentialName,
      type,
      status,
      onPress,
      question,
      onNewConnectionSeen,
      senderDID,
      newBadge,
    } = this.props
    const {
      container,
      newCardContainer,
      avatarSection,
      infoSection,
      companyNameSection,
      descriptionSection,
      companyNameText,
      descriptionText,
      infoSectionTopRow,
      infoSectionBottomRow,
    } = styles

    return (
      <TouchableOpacity
        style={[container, newBadge ? newCardContainer : null]}
        onPress={this.onButtonPress}
      >
        <View style={avatarSection}>
          {typeof image === 'string' ? (
            <Avatar radius={16} src={{ uri: image }} />
          ) : (
            <DefaultLogo
              text={senderName}
              size={32}
              fontSize={17}
            />
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
            {this.renderButtonSection()}
          </View>
          <View style={infoSectionBottomRow}>
            <View style={descriptionSection}>
              <Text
                style={descriptionText}
                numberOfLines={1}
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
      </TouchableOpacity>
    )
  }
}
export { ConnectionCard }
