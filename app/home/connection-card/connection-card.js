// @flow
import React, { Component } from 'react'
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
import { mediumGray } from '../../common/styles/constant'
class ConnectionCard extends Component<ConnectionCardProps, void> {
  state = {
    removeBadge: false,
  }
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
      CONNECTED: 'You connected with ' + senderName + '.',
      RECEIVED: senderName + ' issued you ' + credentialName + '.',
      'ACCEPTED & SAVED': 'Accepted on',
      SHARED: 'You shared ' + credentialName + ' with ' + senderName,
      'PROOF RECEIVED': senderName + ' wants you to share some information',
      'CLAIM OFFER RECEIVED': 'Offering ' + credentialName,
      QUESTION_RECEIVED: question,
      UPDATE_QUESTION_ANSWER: question,
    }

    return statusMsg[status]
  }
  renderButtonSection = () => {
    const { showBadge, date } = this.props
    const {
      dateSection,
      dateText,
      buttonSection,
      dateButtonSection,
      newButtonSection,
      newLabel,
      newLabelText,
    } = styles

    if (this.state.removeBadge) {
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
    } else if (showBadge) {
      return (
        <View style={newButtonSection}>
          <View style={newLabel}>
            <Text style={newLabelText}>NEW</Text>
          </View>
        </View>
      )
    }

    // if (showBadge) {
    //   return (
    //     <View style={newButtonSection}>
    //       <View style={newLabel}>
    //         <Text style={newLabelText}>NEW</Text>
    //       </View>
    //     </View>
    //   )
    // } else if (this.state.removeBadge) {
    //   return (
    //     <View style={dateButtonSection}>
    //       <View style={dateSection}>
    //         <Text style={dateText}>{this.getCorrectDateLabel(date)}</Text>
    //       </View>
    //       <View style={buttonSection}>
    //         <SvgCustomIcon name="ChevronRight" fill={mediumGray} />
    //       </View>
    //     </View>
    //   )
    // }

    // if (!showBadge) {
    //   return (
    //     <View style={dateButtonSection}>
    //       <View style={dateSection}>
    //         <Text style={dateText}>{this.getCorrectDateLabel(date)}</Text>
    //       </View>
    //       <View style={buttonSection}>
    //         <SvgCustomIcon name="ChevronRight" fill={mediumGray} />
    //       </View>
    //     </View>
    //   )
    // } else {
    //   return (
    //     <View style={newButtonSection}>
    //       <View style={newLabel}>
    //         <Text style={newLabelText}>NEW</Text>
    //       </View>
    //     </View>
    //   )
    // }
  }

  render() {
    const {
      image,
      showBadge,
      senderName,
      credentialName,
      type,
      status,
      onPress,
      question,
    } = this.props
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
    } = styles

    return (
      <TouchableOpacity
        style={[
          container,
          this.state.removeBadge ? null : showBadge ? newCardContainer : null,
        ]}
        onPress={() => {
          this.setState({ removeBadge: true }, onPress)
        }}
      >
        <View style={avatarSection}>
          {typeof image === 'string' ? (
            <Avatar radius={16} src={{ uri: image }} />
          ) : (
            <View style={initialsContainer}>
              <Text style={initialsText}>{senderName[0]}</Text>
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
