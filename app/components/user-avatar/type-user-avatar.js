// @flow
import * as React from 'react'
import type { Image as RNImagePickerImage } from 'react-native-image-crop-picker'
import type { GenericObject, ImageSource } from '../../common/type-common'

export type UserAvatarProps = {
  userCanChange?: boolean,
  saveUserSelectedAvatar: (imagePath: string) => void,
  avatarName?: ?ImageSource,
  children?: (avatarSource: ImageSource | number) => React.Element<*>,
}
