// @flow
import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native'
import { SvgSettingIcons } from '../../components/svg-setting-icons'
import { UserAvatar, Avatar } from '../../components'
import { USER_AVATAR_TEST_ID } from '../../settings/settings-constant'
import type { ImageSource } from '../../common/type-common'
import { measurements } from '../../common/styles/measurements'

class SettingsHeader extends React.Component<any, any> {
  renderAvatarWithSource = (avatarSource: number | ImageSource) => (
    <Avatar medium round src={avatarSource} />
  )
  render() {
    return (
      <View style={style.container}>
        <SafeAreaView style={style.safeView}>
          <UserAvatar testID={USER_AVATAR_TEST_ID} userCanChange>
            {this.renderAvatarWithSource}
          </UserAvatar>
          <Text style={style.userName}>Me</Text>
          {/* <View style={style.tokensWrapper}>
            <TouchableOpacity onPress={this.props.tokenScreen}>
              <SvgSettingIcons
                name="TokenIcon"
                width="20"
                height="20"
                fill="#EB9B2D"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={this.props.tokenScreen}>
              <Text style={style.tokens}>{this.props.balance}</Text>
            </TouchableOpacity>
          </View> */}
          {/* <Text style={style.tokensLabel}>TOKENS</Text> */}
        </SafeAreaView>
      </View>
    )
  }
}
export { SettingsHeader }

const style = StyleSheet.create({
  container: {
    height: measurements.settingsHeader,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    position: 'relative',
    zIndex: 100,
    backgroundColor: '#fff',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  safeView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#eaeaea',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  userName: {
    fontFamily: 'Lato',
    fontSize: 17,
    fontWeight: '700',
    color: '#505050',
    marginTop: 12,
    marginBottom: 11,
  },
  tokensWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokens: {
    fontFamily: 'Lato',
    fontSize: 22,
    fontWeight: '400',
    color: '#505050',
    marginLeft: 10,
  },
  tokensLabel: {
    fontFamily: 'Lato',
    fontSize: 11,
    fontWeight: '500',
    color: '#777',
  },
})
