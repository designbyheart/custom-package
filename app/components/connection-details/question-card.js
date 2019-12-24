// @flow
import React, { PureComponent } from 'react'
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native'
import { questionRoute } from '../../common'

// TODO: Fix the <any, {}> to be the correct types for props and state
class QuestionCard extends PureComponent<any, {}> {
  navigateToQuestionScreen = () => {
    this.props.navigation.navigate(questionRoute, { uid: this.props.uid })
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.messageDate}>{this.props.messageDate}</Text>
        <Text style={styles.messageTitle}>{this.props.messageTitle}</Text>
        <Text
          style={styles.messageContent}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {this.props.messageContent}
        </Text>
        <View
          style={[
            styles.buttonsWrapper,
            { display: this.props.showButtons ? 'flex' : 'none' },
          ]}
        >
          <TouchableOpacity
            onPress={this.navigateToQuestionScreen}
            style={[
              styles.buttonView,
              { backgroundColor: this.props.colorBackground },
            ]}
          >
            <Text style={styles.viewText}>View</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.helperView} />
      </View>
    )
  }
}

export { QuestionCard }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingLeft: '7%',
    paddingRight: '7%',
    paddingTop: 15,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  absolute: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    height: 45,
  },
  messageDate: {
    color: '#777',
    fontSize: 11,
    lineHeight: 13,
    textAlign: 'left',
    fontFamily: 'Lato',
  },
  messageTitle: {
    color: '#505050',
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 20,
    textAlign: 'left',
    marginTop: 2,
    marginBottom: 2,
    fontFamily: 'Lato',
  },
  messageContent: {
    color: '#505050',
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'left',
    fontFamily: 'Lato',
  },
  buttonsWrapper: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 15,
  },
  buttonView: {
    padding: 6.5,
    paddingLeft: 26,
    paddingRight: 26,
    borderRadius: 5,
  },
  viewText: {
    color: 'white',
    fontSize: 17,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: 'Lato',
  },
  buttonIgnore: {
    backgroundColor: 'transparent',
    padding: 6.5,
    paddingLeft: 26,
    paddingRight: 26,
    borderRadius: 5,
  },
  ignoreText: {
    color: '#777',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: 'Lato',
  },
  helperView: {
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    width: '100%',
    paddingTop: 15,
  },
})
