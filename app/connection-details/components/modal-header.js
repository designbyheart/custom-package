// @flow
import React from 'react'
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native'
import { ImageColorPicker } from '../../components'
import { CheckmarkBadge } from '../../components/connection-details/checkmark-badge'

// TODO: Fix the <any, void> to be the correct types for props and state
class ModalHeader extends React.Component<any, void> {
  render() {
    const { useColorPicker = false } = this.props

    return (
      <View style={styles.container}>
        <View style={[styles.row, { paddingBottom: 15 }]}>
          <View style={styles.icon}>
            <Image
              style={styles.iconImage}
              source={{ uri: this.props.imageUrl }}
              resizeMode={'cover'}
            />
          </View>
          <View style={styles.header}>
            <Text style={styles.name}>{this.props.institutialName}</Text>
            <Text style={styles.title}>{this.props.credentialText}</Text>
          </View>
          <View style={styles.checkmark}>
            {/* <Image style={styles.checkmarkImage} source={require ('./src/checkmarkBadgeBlue.png')} /> */}
            <CheckmarkBadge color={this.props.colorBackground} />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.header}>
            <Text style={styles.mainTitle}>{this.props.credentialName}</Text>
            {/* <Text style={styles.secured}>Secured By Sovrin</Text> */}
          </View>
          {/* <TouchableOpacity style={styles.share}>
                        <Image style={styles.shareImage} source={require ('./src/shareIcon.png')} />
                    </TouchableOpacity> */}
        </View>
      </View>
    )
  }
}

export { ModalHeader }

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    position: 'relative',
    flexDirection: 'column',
    width: '100%',
    padding: 17,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: {
      height: 0,
      width: 0,
    },
    zIndex: 200,
    elevation: Platform.OS === 'android' ? 8 : 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    width: '100%',
  },
  icon: {
    width: 45,
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  iconImage: {
    width: 32,
    height: 32,
  },
  header: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#505050',
    fontFamily: 'Lato',
  },
  title: {
    fontSize: 14,
    fontWeight: '400',
    color: '#777',
    fontFamily: 'Lato',
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '400',
    color: '#505050',
    fontFamily: 'Lato',
  },
  secured: {
    fontSize: 14,
    fontWeight: '400',
    color: '#777',
    fontFamily: 'Lato',
  },
  checkmark: {
    width: 45,
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  checkmarkImage: {
    width: 23,
    height: 34.5,
  },
  share: {
    width: 45,
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  shareImage: {
    width: 24,
    height: 26,
  },
})
