// @flow
import type { ReactNavigation, Styles } from '../../common/type-common'

export type DangerBannerProps = {
  testID: string,
  onPress?: () => void,
  bannerTitle: string,
  bannerSubtext: string,
  style?: Styles,
}
