//@flow
import RNFetchBlob from 'react-native-fetch-blob'
import uniqueId from 'react-native-unique-id'
import {
  setVcxLogger,
  writeToVcxLog,
  encryptVcxLog,
} from '../bridge/react-native-cxs/RNCxs'
import type { Dispatch } from 'redux'
import { UPDATE_LOG_ISENCRYPTED } from '../send-logs/type-send-logs'

export const CUSTOM_LOG_UTILS = {
  encryptionKey: '',
}

export const customLogger = {
  recordBuffer: [],
  vcxLogFile: null,
  encryptedLogFile: null,
  initOnlyOnce: false,
  logLevel: null,
  alsoLogToConsole: process.env.NODE_ENV !== 'test' && __DEV__,
  MAX_ALLOWED_FILE_BYTES: 10000000,
  log: function(...allArgs: any[]) {
    //console.log(JSON.stringify(allArgs))
    this.addRecord({ levelName: 'log', args: allArgs })
    if (this.alsoLogToConsole) {
      console.log.apply(null, allArgs)
    }
  },
  error: function(...allArgs: any[]) {
    this.addRecord({ levelName: 'error', args: allArgs })
    if (this.alsoLogToConsole) {
      console.error.apply(null, allArgs)
    }
  },
  assert: function(...allArgs: any[]) {
    if (this.alsoLogToConsole) {
      console.assert.apply(null, allArgs)
    }
  },
  clear: function(...allArgs: any[]) {
    if (this.alsoLogToConsole) {
      console.clear.apply(null, allArgs)
    }
  },
  count: function(...allArgs: any[]) {
    if (this.alsoLogToConsole) {
      console.count.apply(null, allArgs)
    }
  },
  debug: function(...allArgs: any[]) {
    this.addRecord({ levelName: 'debug', args: allArgs })
    if (this.alsoLogToConsole) {
      console.debug.apply(null, allArgs)
    }
  },
  dir: function(...allArgs: any[]) {
    if (this.alsoLogToConsole) {
      console.dir.apply(null, allArgs)
    }
  },
  dirxml: function(...allArgs: any[]) {
    if (this.alsoLogToConsole) {
      console.dirxml.apply(null, allArgs)
    }
  },
  group: function(...allArgs: any[]) {
    if (this.alsoLogToConsole) {
      console.group.apply(null, allArgs)
    }
  },
  groupCollapsed: function(...allArgs: any[]) {
    if (this.alsoLogToConsole) {
      console.groupCollapsed.apply(null, allArgs)
    }
  },
  groupEnd: function(...allArgs: any[]) {
    if (this.alsoLogToConsole) {
      console.groupEnd.apply(null, allArgs)
    }
  },
  info: function(...allArgs: any[]) {
    if (this.alsoLogToConsole) {
      console.info.apply(null, allArgs)
    }
  },
  table: function(...allArgs: any[]) {
    if (this.alsoLogToConsole) {
      console.table.apply(null, allArgs)
    }
  },
  time: function(...allArgs: any[]) {
    if (this.alsoLogToConsole) {
      console.time.apply(null, allArgs)
    }
  },
  timeEnd: function(...allArgs: any[]) {
    if (this.alsoLogToConsole) {
      console.timeEnd.apply(null, allArgs)
    }
  },
  trace: function(...allArgs: any[]) {
    this.addRecord({ levelName: 'trace', args: allArgs })
    if (this.alsoLogToConsole) {
      console.trace.apply(null, allArgs)
    }
  },
  warn: function(...allArgs: any[]) {
    this.addRecord({ levelName: 'warn', args: allArgs })
    if (this.alsoLogToConsole) {
      console.warn.apply(null, allArgs)
    }
  },

  captureException: function(error: Error) {
    this.log(error.toString())
  },

  setVcxLogFile: function(logFile: string) {
    this.vcxLogFile = logFile
  },

  getVcxLogFile: function() {
    return this.vcxLogFile
  },

  getEncryptedVcxLogFile: function() {
    return this.encryptedLogFile
  },

  init: function(levelName: string) {
    if (!this.initOnlyOnce) {
      this.initOnlyOnce = true
      this.logLevel = levelName

      const fetchPromise = fetch(
        'https://connect.me/sendlogs.public.encryption.key.txt'
      )
      if (fetchPromise) {
        fetchPromise
          .then(function(response) {
            return response.text()
          })
          .then(function(verKey) {
            //console.log('The encryption key is: ', verKey)
            CUSTOM_LOG_UTILS.encryptionKey = verKey
          })
      }

      // invoke the RNIndy.setVcxLogger function
      uniqueId()
        .then(uniqueIdent => {
          //console.log('The app unique id is: ', uniqueIdent)
          setVcxLogger(this.logLevel, uniqueIdent, this.MAX_ALLOWED_FILE_BYTES)
            .then(logFilePath => {
              this.setVcxLogFile(logFilePath)
              //console.log('Setting vcx log file to: ', logFilePath)
            })
            .catch(error => {
              console.error('Error setting vcx log file: ', error)
            })
        })
        .catch(error => {
          console.error('Error getting unique id in redux store: ', error)
        })
    }
  },

  addRecord: function(record: any) {
    // write the logging record to the debug file
    const rotatingLog = this.getVcxLogFile()
    if (rotatingLog) {
      RNFetchBlob.fs
        .exists(rotatingLog)
        .then(exists => {
          if (exists) {
            if (this.recordBuffer.length) {
              for (let i = 0; i < this.recordBuffer.length; ++i) {
                this.writeToLog(rotatingLog, this.recordBuffer[i])
              }
              this.recordBuffer.length = 0
            }
            this.writeToLog(rotatingLog, record)
          } else {
            this.addRecordToBuffer(record)
          }
        })
        .catch(() => {
          console.log('Error when checking if file exists: ', rotatingLog)
        })
    } else {
      this.addRecordToBuffer(record)
    }
  },

  addRecordToBuffer: function(record: any) {
    if (this.recordBuffer.length <= 0 && !this.initOnlyOnce) {
      // This logic MUST ensure that this.init() is only invoked ONCE
      this.init()
    }
    this.recordBuffer.push(record)
  },

  writeToLog: function(rotatingLog: string, record: any) {
    const recordAsString = JSON.stringify(record)

    if (recordAsString.indexOf('%c prev state') === -1) {
      writeToVcxLog(
        'ConnectMe.ReactNative',
        record.levelName,
        recordAsString,
        rotatingLog
      )
        .then(() => {
          //console.log('Wrote log message ' + recordAsString + ' to log file: ', rotatingLog)
        })
        .catch(error => {
          console.error(
            'Error writing log message ' + recordAsString + ' to log file: ',
            rotatingLog
          )
        })
    }
  },

  encryptLogFile: async function() {
    const rotatingLog = this.getVcxLogFile()
    this.encryptedLogFile = await encryptVcxLog(
      rotatingLog,
      CUSTOM_LOG_UTILS.encryptionKey
    )
    //console.log('Setting encrypted vcx log file to: ', this.encryptedLogFile)
    return this.encryptedLogFile
  },

  clearRecords: function() {},

  getRecords: function() {},
}
