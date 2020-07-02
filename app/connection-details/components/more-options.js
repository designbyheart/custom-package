// @flow
import React, { Component } from 'react'
import SvgCustomIcon from '../../components/svg-custom-icon'
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  Platform,
  StyleSheet,
} from 'react-native'
import { measurements } from '../../../app/common/styles/measurements'
import { deleteConnectionAction } from '../../store/connections-store'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getUserAvatarSource } from '../../store/store-selector'
import type { Store } from '../../store/type-store'
import { grey, white } from '../../common/styles'
import { DefaultLogo } from '../../components/default-logo/default-logo'

const defaultAvatar = require('../../images/UserAvatar.png')
// TODO: Fix the <any, void> to be the correct types for props and state
class MoreOptions extends Component<any, void> {
  onDeleteConnection = senderDID => {
    this.props.deleteConnectionAction(senderDID)
    this.props.navigation.goBack(null)
  }
  render() {
    const { navigation } = this.props

    const { key, params } = this.props.navigation.state
    let avatarSource = this.props.userAvatarSource || defaultAvatar

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.closeScreenWrapper}
          onPress={this.props.moreOptionsClose}
        />
        <View style={styles.smallSquare} />
        <View style={styles.contentWrapper}>
          <View style={styles.row}>
            {typeof params.image === 'string' ? (
                <Image style={styles.image} source={{ uri: params.image }} />
              ) :
              <View style={{marginRight: 5}}>
                <DefaultLogo
                  text={params.senderName[0]}
                  size={24}
                  fontSize={12}
                />
              </View>
            }
            <Text style={styles.text}>did: {params.senderDID}</Text>
          </View>
          <View style={styles.row}>
            <Image style={styles.image} source={avatarSource} />
            <Text style={styles.text}>did: {params.identifier}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => this.onDeleteConnection(params.senderDID)}
          >
            <SvgCustomIcon
              name="TrashCan"
              fill={'#236BAE'}
              width={24}
              height={24}
            />
            <Text style={styles.buttonText}>Delete Connection</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.closeButtonWrapper}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={this.props.moreOptionsClose}
          >
            <SvgCustomIcon
              name="CloseIcon"
              fill={'#777777'}
              width={12}
              height={12}
            />
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}
const mapStateToProps = (state: Store) => ({
  userAvatarSource: getUserAvatarSource(state.user.avatarName),
})
const mapDispatchToProps = dispatch =>
  bindActionCreators({ deleteConnectionAction }, dispatch)
export default connect(mapStateToProps, mapDispatchToProps)(MoreOptions)

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    paddingTop: 40,
    zIndex: 999,
    alignItems: 'flex-end',
    width: '100%',
    paddingLeft: '2%',
    paddingRight: '2%',
    height: measurements.WINDOW_HEIGHT,
  },
  closeScreenWrapper: {
    position: 'absolute',
    backgroundColor: 'transparent',
    width: '100%',
    height: '100%',
  },
  smallSquare: {
    position: 'relative',
    backgroundColor: 'white',
    width: 40,
    height: 40,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 7,
  },
  closeButtonWrapper: {
    position: 'absolute',
    zIndex: 999,
    width: 40,
    height: 40,
    top: 40,
    right: '2%',
    elevation: 13,
  },
  closeButton: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    width: 14,
    height: 14,
  },
  contentWrapper: {
    position: 'relative',
    backgroundColor: 'white',
    padding: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
    maxWidth: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: 12,
  },
  image: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 5,
  },
  text: {
    textAlign: 'left',
    fontWeight: '500',
    fontSize: 17,
    color: '#777',
    fontFamily: 'Lato',
  },
  deleteButton: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  trashCanIcon: {
    width: 19,
    height: 24,
    marginRight: 8,
    marginLeft: 3,
  },
  buttonText: {
    textAlign: 'left',
    fontWeight: '500',
    fontSize: 17,
    color: '#236BAE',
    fontFamily: 'Lato',
  },
})
