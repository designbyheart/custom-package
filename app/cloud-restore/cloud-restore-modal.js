// @flow

import React, { PureComponent } from 'react'
import {
  View,
  Text,
  Platform,
  Image,
  LayoutAnimation,
  UIManager,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { createStackNavigator } from 'react-navigation'
import { PanGestureHandler, State } from 'react-native-gesture-handler'

import type { Store } from '../store/type-store'

import {
  selectRecoveryMethodRoute,
  exportBackupFileRoute,
  settingsRoute,
  settingsTabRoute,
  cloudRestoreModalRoute,
  cloudRestoreRoute,
  lockEnterPinRoute,
} from '../common'
import { withStatusBar } from '../components/status-bar/status-bar'

import {
  Container,
  CustomView,
  CustomText,
  Icon,
  CustomButton,
  CustomHeader,
} from '../components'
import { getCloudBackupStatus } from '../store/store-selector'
import {
  cloudBackup,
  resetCloudBackupStatus,
  setAutoCloudBackupEnabled,
} from '../backup/backup-store'
import { color } from '../common/styles/constant'
//TODO: jy-copy and pasted questionStyles from the question modal, should put these in on place once generic modal is made
import styles, { questionStyles } from '../backup/styles'
const cmImage = require('../images/cb-ConnectMe.png')
const downloadImage = require('../images/Group.png')

const successImg = require('../images/Success.png')
const errorImg = require('../images/Sad_Face_Red_Error.png')

import type { CloudBackupScreenProps } from '../backup/type-backup'
import type { RestoreProps } from '../restore/type-restore'

import { QuestionScreenHeader } from '../question/components/question-screen-header'

import { Loader } from '../components'
import {
  CLOUD_BACKUP_LOADING,
  CLOUD_BACKUP_COMPLETE,
  CLOUD_BACKUP_FAILURE,
} from '../backup/type-backup'
import { safeSet } from '../services/storage'
import { RestoreStatus } from '../restore/type-restore'

const { height } = Dimensions.get('window')
export class CloudRestoreModal extends PureComponent<
  CloudBackupScreenProps,
  void
> {
  _translateY = new Animated.Value(0)
  constructor(props: CloudBackupScreenProps) {
    super(props)
  }
  componentDidMount = () => {}

  static navigationOptions = ({ navigation }: { navigation: any }) => ({
    header: null,
  })

  componentDidUpdate(prevProps: RestoreProps) {
    if (
      !this.props.restore.error &&
      this.props.restore.status === RestoreStatus.RESTORE_DATA_STORE_SUCCESS
      // && this.props.route === restoreWaitRoute
    ) {
      // TODO: the params have to be removed when the lockEnterPinRoute design is changed in according with the recovery screen.
      this.props.navigation.navigate(lockEnterPinRoute, {
        fromScreen: 'recovery', //cloudbackupRoute?
      })
    }
    if (this.props.error) {
      this.props.navigation.navigate(cloudRestoreRoute)
    }
  }
  _getTransform = translateY => [{ translateY }]

  _getOpacity = translateY =>
    translateY.interpolate({
      inputRange: [0, height],
      outputRange: [1, 0.2],
      extrapolate: 'clamp',
    })

  // this a common pattern when we want to be sure that we are not running
  // actions after a component is unmounted
  // in our case, user can close modal either by pressing "okay" or clicking outside
  // so we need to be sure that we are not running code after this component
  // is unmounted from react-native tree
  isUnmounted = false
  // this variable is just to ensure that on slow devices
  // if user clicks on gray area and component was already scheduled to close
  // by auto close, or by user clicking on okay button and then auto-close trigger
  // we want to make sure that close is triggered by either action
  // and we don't want to run close again in any case
  isCloseTriggered = false

  componentWillUnmount() {
    this.isUnmounted = true
  }
  onCancel = () => {}

  render() {
    if (this.props.error) {
      this.props.navigation.navigate(cloudRestoreRoute)
    }
    const transform = this._getTransform(this._translateY)
    const opacity = this._getOpacity(this._translateY)
    return (
      <Animated.View
        style={[
          questionStyles.container,
          questionStyles.mainContainer,
          {
            opacity,
          },
        ]}
      >
        <Animated.View style={[questionStyles.container, { transform }]}>
          <Container style={[questionStyles.headerContainer]}>
            <Animated.View style={[questionStyles.container]}>
              <QuestionScreenHeader
                hideHandlebar={true}
                onCancel={this.onCancel}
              />
            </Animated.View>
          </Container>
          <Animated.View style={[questionStyles.screenContainer]}>
            <View>
              <CustomView
                row
                style={[questionStyles.questionSenderContainer]}
                center
              >
                <CustomView>
                  <Image
                    style={[questionStyles.questionSenderLogo]}
                    source={cmImage}
                    resizeMode="cover"
                  />
                </CustomView>
                <Container style={[questionStyles.questionSenderName]}>
                  <CustomText
                    size="h5"
                    numberOfLines={2}
                    bg={false}
                    bold
                    style={[{ color: color.bg.tertiary.font.seventh }]}
                  >
                    Cloud Backup
                  </CustomText>
                </Container>
              </CustomView>
              <CustomView
                bg="tertiary"
                style={[questionStyles.questionLoaderContainer]}
              >
                <ActivityIndicator size="large" />
                <CustomText center bg={false}>
                  {this.props.message}
                </CustomText>
              </CustomView>
              {/* {this.getModalBody(this.props.cloudBackupStatus)} */}
            </View>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    )
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    { cloudBackup, resetCloudBackupStatus, setAutoCloudBackupEnabled },
    dispatch
  )

const mapStateToProps = (state: Store) => {
  return {
    cloudBackupStatus: getCloudBackupStatus(state),
    message: state.cloudRestore.message,
    error: state.cloudRestore.error,
    restore: state.restore,
  }
}

export const CloudRestoreModalStack = createStackNavigator(
  {
    [cloudRestoreModalRoute]: {
      screen: withStatusBar({ color: 'white' })(
        connect(mapStateToProps, mapDispatchToProps)(CloudRestoreModal)
      ),
    },
  },
  {
    cardStyle: { backgroundColor: 'transparent' },
    transitionConfig: () => ({
      containerStyle: {
        backgroundColor: 'transparent',
      },
    }),
  }
)

export default CloudRestoreModalStack
