// @flow
import React, { Component } from 'react'
import { StyleSheet, Image } from 'react-native'
import { connect } from 'react-redux'
import VersionNumber from 'react-native-version-number'
import { ListItem } from 'react-native-elements'
import { EvaIcon, ARROW_RIGHT_ICON } from '../common/icons'

import type { AboutAppProps, AboutAppListItemProps } from './type-about-app'
import type { Store } from '../store/type-store'

import { Container, CustomText, CustomView } from '../components'
import { OFFSET_1X, OFFSET_2X, lightGray } from '../common/styles'
import { aboutAppRoute, privacyTNCRoute } from '../common'
import { PrivacyTNC } from '../privacy-tnc/privacy-tnc-screen'
import { getEnvironmentName } from '../store/config-store'
import { headerNavigationOptions } from '../navigation/navigation-header-config'
import { moderateScale } from 'react-native-size-matters'
import { colors, fontFamily, fontSizes } from '../common/styles/constant'

const styles = StyleSheet.create({
  itemContainer: {
    marginStart: moderateScale(16),
    width: '100%',
    height: moderateScale(56),
    alignItems: 'center',
    flexDirection: 'row',
  },
  itemText: {
    fontSize: moderateScale(fontSizes.size5),
    fontWeight: '400',
    width: '100%',
    color: colors.cmGray1,
    textAlign: 'left',
    fontFamily: fontFamily,
  },
  headerLeft: {
    width: OFFSET_2X,
  },
  thickLine: {
    height: 2,
    width: 140,
    borderBottomColor: lightGray,
    borderBottomWidth: 2,
  },
  topFloatText: {
    paddingBottom: OFFSET_1X,
  },
  bottomFloatText: {
    paddingBottom: OFFSET_1X / 2,
  },
})

export const AboutAppListItem = ({
  titleValue,
  onPress,
}: AboutAppListItemProps) => {
  return (
    <ListItem
      title={
        <CustomView>
          <CustomText h5 semiBold bg="fifth">
            {titleValue}
          </CustomText>
        </CustomView>
      }
      onPress={onPress}
      rightIcon={rightIcon}
    />
  )
}

const rightIcon = <EvaIcon name={ARROW_RIGHT_ICON} color={colors.cmGray3} />

const logoConnectMe = <Image source={require('../images/logo_connectme.png')} />
const logoEvernym = <Image source={require('../images/logo_evernym.png')} />
const logoSovrin = <Image source={require('../images/logo_sovrin.png')} />
const versionNumber = VersionNumber

export class AboutApp extends Component<AboutAppProps, void> {
  openTermsAndConditions = () => {
    this.props.navigation.navigate(privacyTNCRoute, PrivacyTNC.INFO_TYPE.TNC)
  }

  openPrivacyPolicy = () => {
    this.props.navigation.navigate(
      privacyTNCRoute,
      PrivacyTNC.INFO_TYPE.PRIVACY
    )
  }

  render() {
    return (
      <Container tertiary>
        <CustomView center doubleVerticalSpace>
          {logoConnectMe}
          <CustomView center doubleVerticalSpace>
            <CustomText bg="tertiary" tertiary transparentBg semiBold>
              VERSION # {versionNumber.appVersion}.{versionNumber.buildVersion}
            </CustomText>
          </CustomView>
          <CustomView center verticalSpace>
            <CustomText bg="tertiary" tertiary transparentBg semiBold>
              {this.props.environmentName}
            </CustomText>
          </CustomView>
          <CustomView verticalSpace vCenter style={[styles.thickLine]} />
          <CustomView doubleVerticalSpace>
            <CustomText
              bg="tertiary"
              tertiary
              transparentBg
              h7
              style={[styles.topFloatText]}
            >
              built by
            </CustomText>
            {logoEvernym}
          </CustomView>
          <CustomView verticalSpace>
            <CustomText
              bg="tertiary"
              tertiary
              transparentBg
              h7
              style={[styles.bottomFloatText]}
            >
              powered by
            </CustomText>
            {logoSovrin}
          </CustomView>
        </CustomView>
        <Container>
          {/* TODO: move the below titles also to constants */}
          <AboutAppListItem
            titleValue={'Terms and Conditions'}
            onPress={this.openTermsAndConditions}
          />
          <AboutAppListItem
            titleValue={'Privacy Policy'}
            onPress={this.openPrivacyPolicy}
          />
        </Container>
      </Container>
    )
  }
}

const mapStateToProps = (state: Store) => ({
  environmentName: getEnvironmentName(state.config),
})

const AboutAppScreen = connect(mapStateToProps)(AboutApp)

export const aboutAppScreen = {
  routeName: aboutAppRoute,
  screen: AboutAppScreen,
  options: {
    ...headerNavigationOptions({ title: 'About this App' }),
  },
}
