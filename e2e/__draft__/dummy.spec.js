/**
 * @jest-environment node
 */

// @flow

import { element, by, waitFor, expect } from 'detox'
import {
  BURGER_MENU,
  MENU_SETTINGS,
  SETTINGS_PASSCODE,
  PIN_CODE_INPUT_BOX,
  TEST_PASS_CODE,
  TEST_PASS_CODE_CHANGED,
  SETTINGS_CHAT,
  CHAT_CANCEL,
  CHAT_CLOSE,
  SETTINGS_ABOUT,
  ABOUT_BACK_ARROW,
  SETTINGS_ONFIDO,
  ONFIDO_BACK_ARROW,
} from '../utils/test-constants'
import { intersection } from 'ramda'

describe('Test suite title', () => {
  it('Test case title', async () => {})
})
