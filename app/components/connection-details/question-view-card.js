// @flow
import React from 'react'
import {
  Text,
  View,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { questionRoute } from '../../common'

let ScreenHeight = Dimensions.get('window').height

// TODO: Fix the <any, void> to be the correct types for props and state
class QuestionViewCard extends React.Component<any, {}> {
  navigateToQuestionScreen = () => {
    this.props.navigation.navigate(questionRoute, { uid: this.props.uid })
  }

  render() {
    const { navigation } = this.props

    const { key, params } = this.props.navigation.state

    return (
      <View style={styles.container}>
        <View style={styles.contentRow}>
          <View style={styles.content}>
            <Text style={styles.messageDate}>{this.props.messageDate} - </Text>
            <Text style={styles.requestStatus}>{this.props.requestStatus}</Text>
          </View>
          <Text style={styles.requestAction}>{this.props.requestAction}</Text>
        </View>
      </View>
    )
  }
}

export { QuestionViewCard }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '86%',
    marginLeft: '7%',
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  contentRow: {
    flex: 1,
    alignItems: 'flex-start',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  messageDate: {
    color: '#777',
    fontSize: 11,
    lineHeight: 13,
    textAlign: 'left',
    fontFamily: 'Lato',
  },
  requestStatus: {
    color: '#777',
    fontSize: 11,
    lineHeight: 13,
    textAlign: 'left',
    fontFamily: 'Lato',
  },
  requestAction: {
    color: '#a5a5a5',
    fontSize: 14,
    fontWeight: '700',
    paddingTop: 3,
    fontFamily: 'Lato',
  },
  buttonUndo: {
    paddingLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#236BAE',
    fontSize: 17,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: 'Lato',
  },
})
