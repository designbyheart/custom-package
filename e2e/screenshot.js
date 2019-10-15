// @flow
import gm from 'gm'
import { promisify } from 'util'
import { exec } from 'child-process-async'
import { pathExists, move, remove } from 'fs-extra'
import chalk from 'chalk'
import { flatten, compose, values, filter, prop, tap, head } from 'ramda'
import { getDeviceType, ANDROID } from './test-constants'

const SIZE = {
  iphonex: {
    width: 1125,
    height: 2436,
    cropHeight: 90,
  },
  iphone7: {
    width: 750,
    height: 1334,
    cropHeight: 40,
  },
  iphone5s: {
    width: 640,
    height: 1136,
    cropHeight: 40,
  },
}

const SIMULATOR_NAME_MAP = {
  iphone7: 'iPhone 7',
  iphonex: 'iPhone X',
  iphone5s: 'iPhone 5s',
}

const COMPARE_ERROR_TOLERANCE = 0.0001
const defaultSimulator = 'iphone7'
const baseDirectory = '__e2e__'
const { SIMULATOR = defaultSimulator, UPDATE } = process.env
const simulator = SIMULATOR ? SIMULATOR.toLowerCase() : defaultSimulator
let bootedDeviceId = 'booted'

const BOOTED = 'Booted'
const SHUTDOWN = 'Shutdown'
export type Device = {
  state: typeof BOOTED | typeof SHUTDOWN,
  name: string,
  udid: string,
}

const isBooted = (device: Device) => {
  const { name, state } = device

  return (
    name.toLowerCase() === SIMULATOR_NAME_MAP[simulator].toLowerCase() &&
    state === BOOTED
  )
}

export const storeBootedDeviceId = async () => {
  const { stdout } = await exec('xcrun simctl list devices --json')
  const list = JSON.parse(stdout)
  bootedDeviceId = compose(
    prop('udid'),
    head,
    filter(isBooted),
    flatten,
    values,
    prop('devices')
  )(list)
}

export function getNewScreenshotPath(name: string) {
  return `${baseDirectory}/tmp/${simulator}/${name}`
}

export function getExistingScreenshotPath(name: string) {
  return `${baseDirectory}/screenshots/${simulator}/${name}`
}

export function getDiffPath(name: string) {
  return `${baseDirectory}/diff/${simulator}/${name}`
}

const diff = promisify(gm.compare)
const diffOptions = file => ({ file, tolerance: COMPARE_ERROR_TOLERANCE })

const areSame = async (image1: string, image2: string, diffImagePath: string) =>
  await diff(image1, image2, diffOptions(diffImagePath))

// removes header of simulator that contains date and battery icon
// which messes up our screenshot comparison
export async function removeHeader(image: string) {
  return new Promise((resolve, reject) => {
    const { width, height, cropHeight } = SIZE[simulator]
    gm(image)
      .crop(width, height - cropHeight, 0, cropHeight)
      .write(image, error => {
        if (error) {
          reject(error)
        }

        resolve()
      })
  })
}

export async function matchScreenshot(name: string) {
  // TODO:KS Add support for screenshot testing for Android as well
  if (getDeviceType() === ANDROID) {
    return
  }

  const newScreenshot = getNewScreenshotPath(name)

  await exec(`xcrun simctl io ${bootedDeviceId} screenshot ${newScreenshot}`)
  await removeHeader(newScreenshot)

  const existingScreenshot = getExistingScreenshotPath(name)

  const exists = await pathExists(existingScreenshot)
  if (!exists) {
    await move(newScreenshot, existingScreenshot)
    console.log(chalk.green(`New screenshot captured at ${existingScreenshot}`))

    return
  }

  if (UPDATE) {
    await remove(existingScreenshot)
    await move(newScreenshot, existingScreenshot)
    console.log(chalk.green(`Updated screenshot ${existingScreenshot}`))

    return
  }

  const diffImagePath = getDiffPath(name)
  const result = await areSame(existingScreenshot, newScreenshot, diffImagePath)
  if (!result) {
    console.log(
      chalk.red(
        `Existing screenshot at '${existingScreenshot}' and new screenshot at '${newScreenshot}' are not same. Please see difference at ${diffImagePath}`
      )
    )

    throw new Error(
      `Failed to match screenshot ${name}. Check diff ${diffImagePath}`
    )
  }
}
