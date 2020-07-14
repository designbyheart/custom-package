// @flow

import { useState, useEffect } from 'react'
import { InteractionManager } from 'react-native'

export function useInteractionDone() {
  const [interactionDone, setInteractionDone] = useState(false)

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setInteractionDone(true)
    })
  }, [])

  return [interactionDone]
}
