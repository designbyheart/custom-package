// @flow
import type { CustomError } from '../common/type-common'
import type {
  NavigationScreenProp,
  NavigationLeafRoute,
} from 'react-navigation'

export type PrivacyTNCProps = {} & {
  navigation: NavigationScreenProp<{|
    ...NavigationLeafRoute,
    params: {|
      url: string,
    |},
  |}>,
}

export type PrivacyTNCState = {
  error: null | CustomError,
}
