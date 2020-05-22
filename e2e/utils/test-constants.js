// @flow
import { by } from 'detox'

export const IOS = 'ios'
export const ANDROID = 'android'

// Don't access via static import, use getDeviceType
let DEVICE_TYPE = IOS
export function setDeviceType(platform: string) {
  DEVICE_TYPE = platform
}
export const getDeviceType = () => DEVICE_TYPE

// common
export const OK_TEXT_ALERT = 'OK'
export const NATIVE_ALERT_TYPE = () =>
  DEVICE_TYPE === IOS ? '_UIAlertControllerActionView' : 'android.widget.Button'
export const NATIVE_ALERT_OK_MATCHER = () =>
  DEVICE_TYPE === IOS
    ? by.label(OK_TEXT_ALERT).and(by.type(NATIVE_ALERT_TYPE()))
    : by.text(OK_TEXT_ALERT).and(by.type(NATIVE_ALERT_TYPE()))
export const TEST_PASS_CODE = '000000'
export const USER_AVATAR = 'user-avatar'
export const BACK_ARROW = 'back-arrow-touchable'
export const BURGER_MENU = 'burger-menu'
export const SCAN_BUTTON = 'Scan'

// home
export const HOME_FEEDBACK_BUTTON = 'home-feedback-id-label'
export const HOME_CONTAINER = 'home-container'
export const HOME_HEADER = 'Home'

// claim offer
export const CLAIM_OFFER_ICON_CLOSE = 'claim-offer-icon-close-touchable'
export const CLAIM_OFFER_ACCEPT = 'claim-offer-footer-accept'
export const CLAIM_OFFER_DENY = 'claim-offer-footer-deny'
export const CLAIM_OFFER_SUCCESS_MODAL_CONTINUE =
  'claim-request-success-continue'

// connection history
export const HISTORY_ICON_CLOSE = 'connection-history-icon-close-touchable'
export const HISTORY_ICON_DELETE = 'connection-history-icon-delete-touchable'
export const HISTORY_DETAIL_BACK = 'history-details-back-arrow-touchable'

// expired token
export const EXPIRED_TOKEN = 'expired-token-container'

//Request
export const REQUEST_CONTAINER = 'request-container'

// invitation
export const INVITATION_ACCEPT = 'invitation-accept'
export const INVITATION_DECLINE = 'invitation-deny'
export const INVITATION_SUCCESS_MODAL_CONTINUE = 'invitation-success-continue'
export const ACCEPT_INVITATION_LABEL = 'Allow'

// lock related screens
export const LOCK_SELECTION_OR_TEXT = 'lock-selection-or-text-touchable'
export const LOCK_SELECTION_VIEW = 'lock-selection-view'
export const LOCK_SELECTION_PIN_CODE = 'pin-code-selection-touchable'
export const LOCK_SELECTION_TOUCH_ID = 'touch-id-selection-touchable'
export const LOCK_SETUP_SUCCESS_CLOSE_BUTTON = 'close-button'
export const PIN_CODE_INPUT_BOX = 'pin-code-input-box'

// proof request
export const PROOF_REQUEST_ACCEPT = 'proof-request-accept'
export const PROOF_REQUEST_DENY = 'proof-request-deny'
export const PROOF_REQUEST_ICON_CLOSE = 'proof-request-icon-close-touchable'
export const PROOF_REQUEST_MODAL_CONTINUE = 'send-proof-success-continue'

// qr-code
export const QR_CODE_INPUT_ENV_SWITCH = 'qr-code-text-input-env-switch'
export const QR_CODE_ENV_SWITCH_URL =
  'https://s3-us-west-2.amazonaws.com/vcx-env/dev'
export const QR_CODE_NATIVE_ALERT_SWITCH_TEXT = 'Switch'
export const QR_CODE_SCANNER_CLOSE_BUTTON = 'close-qr-scanner-icon'

// settings
// export const SETTINGS_PASS_CODE = 'settings-pass-code-label-touchable'
// export const SETTINGS_TOUCH_ID = 'settings-touch-id-label-touchable'
// export const SETTINGS_CHAT = 'settings-chat-id-label-touchable'
export const SETTINGS_CONTAINER = 'settings-container'
export const SETTINGS_HEADER = 'Settings'
export const SETTINGS_CREATE_BACKUP = 'Create a Backup'
export const BACKUP_CLOSE = 'recovery-header-close-image'
export const SETTINGS_BIOMETRICS = 'Biometrics'
export const BIOMETRICS_OK = 'Ok'
export const SETTINGS_PASSCODE = 'Passcode'
export const PASSCODE_BACK_ARROW = 'back-arrow'
export const SETTINGS_CHAT = 'Chat With Us'
export const CHAT_CANCEL = 'Cancel'
export const CHAT_CLOSE = 'Close'
export const SETTINGS_ABOUT = 'About'
export const ABOUT_BACK_ARROW = 'back-arrow-touchable'
export const SETTINGS_ONFIDO = 'ONFIDO'
export const ONFIDO_BACK_ARROW = 'header-back'

// switch environment screen
export const SWITCH_ENVIRONMENT_DEV_BUTTON = 'switch-environment-dev'
export const SWITCH_ENVIRONMENT_QA_TEST1_BUTTON = 'switch-environment-qatest1'
export const SWITCH_ENVIRONMENT_DEV_TEAM1_BUTTON = 'switch-environment-devteam1'
export const APP_ENVIRONMENT = `switch-environment-${process.env.environment ||
  'qa'}`
export const SWITCH_ENVIRONMENT_SAVE_BUTTON = 'switch-environment-footer-accept'

// screenshot names
export const SCREENSHOT_HOME = 'home.jpg'

// menu
export const MENU_HOME = 'Home 0'
export const MENU_MY_CONNECTIONS = 'My Connections'
export const MENU_SETTINGS = 'Settings'
