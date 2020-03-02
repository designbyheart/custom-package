// @flow
import React, { PureComponent } from 'react'
import { Text, View, ScrollView, StyleSheet } from 'react-native'
import { Border } from '../../components/connection-details/border'
import { Avatar } from '../../components/avatar/avatar'
import { BLANK_ATTRIBUTE_DATA_TEXT } from '../type-connection-details'

// TODO: Fix the <any, {}> to be the correct types for props and state
class ModalContent extends PureComponent<any, {}> {
  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollViewWrapper}>
          {this.props.content.map((userData, index) => (
            <View key={index} style={styles.wrapper}>
              <View style={styles.textAvatarWrapper}>
                <View style={styles.textWrapper}>
                  <Text style={styles.title}>{userData.label}</Text>
                  {// Replace empty data string with (none) in lighter gray
                  userData.data === '' ? (
                    <Text style={styles.contentGray}>
                      {BLANK_ATTRIBUTE_DATA_TEXT}
                    </Text>
                  ) : (
                    <Text style={styles.content}>{userData.data}</Text>
                  )}
                </View>
                {this.props.showSidePicture && (
                  <View style={styles.avatarWrapper}>
                    <Avatar radius={16} src={{ uri: this.props.imageUrl }} />
                  </View>
                )}
              </View>
              <Border borderColor={'#a5a5a5'} />
            </View>
          ))}
        </ScrollView>
      </View>
    )
  }
}

export { ModalContent }

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
  },
  scrollViewWrapper: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  wrapper: {
    backgroundColor: '#f2f2f2',
    width: '90%',
    marginLeft: '5%',
    paddingTop: 12,
    position: 'relative',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#a5a5a5',
    width: '100%',
    textAlign: 'left',
    marginBottom: 2,
    fontFamily: 'Lato',
  },
  content: {
    fontSize: 17,
    fontWeight: '400',
    color: '#505050',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'Lato',
  },
  contentGray: {
    fontSize: 17,
    fontWeight: '400',
    color: '#a5a5a5',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'Lato',
  },
  textAvatarWrapper: {
    width: '98.5%',
    flexDirection: 'row',
  },
  textWrapper: {
    width: '85%',
    paddingBottom: 12,
  },
  avatarWrapper: {
    width: '15%',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
