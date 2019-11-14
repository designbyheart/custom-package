// @flow

import detox from 'detox'
import { exec } from 'child-process-async'
import { getBootedDeviceId } from './screenshot'

const { element, by, expect, device } = detox

export const tapOn = async (id: string) => {
  const fetchedElement = element(by.id(id))
  await fetchedElement.tap()
}

// courtesy of https://github.com/wix/detox/issues/445#issuecomment-514801808
export const readVisibleText = async (testID: string) => {
  try {
    await expect(element(by.id(testID))).toHaveText(
      '_you_cant_possible_have_this_text_'
    )
    throw new Error('are you kidding me?')
  } catch (error) {
    if (device.getPlatform() === 'ios') {
      const start = `accessibilityLabel was "`
      const end = '" on '
      const errorMessage = error.message.toString()
      const [, restMessage] = errorMessage.split(start)
      const [label] = restMessage.split(end)
      return label
    } else {
      const start = 'Got:'
      const end = '}"'
      const errorMessage = error.message.toString()
      const [, restMessage] = errorMessage.split(start)
      const [label] = restMessage.split(end)
      const value = label.split(',')
      var combineText = value.find((i: string) => i.includes('text=')).trim()
      const [, elementText] = combineText.split('=')
      return elementText
    }
  }
}

export function wait(delay: *): Promise<void> {
  return new Promise(function(resolve) {
    setTimeout(resolve, delay)
  })
}
