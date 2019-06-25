// @flow

declare module 'react-native-gesture-handler' {
  declare interface StateI {
    END: 'END';
    BEGAN: 'BEGAN';
  }
  declare var State: StateI
  declare module.exports: any
}
