// @flow

import detox from 'detox'

const { element, by } = detox

export const tapOn = async (id: string) => {
  const fetchedElement = element(by.id(id))
  await fetchedElement.tap()
}
