// @flow

import React from 'react'

import type { GenericObject } from '../../../common/type-common'

import CustomText from '../../text'
import { color } from '../../../common/styles'

export function BottomUpSliderText(props: GenericObject) {
  return (
    <CustomText
      bg={false}
      bold
      {...props}
      style={[
        { color: color.bg.tertiary.font.seventh },
        ...(props.style || []),
      ]}
    >
      {props.children}
    </CustomText>
  )
}
