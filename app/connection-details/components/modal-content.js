// @flow
import React, { PureComponent, Component } from 'react'
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native'
import RNFetchBlob from 'rn-fetch-blob'
import FileViewer from 'react-native-file-viewer'

import { Border } from '../../components/connection-details/border'
import { Avatar } from '../../components/avatar/avatar'
import { BLANK_ATTRIBUTE_DATA_TEXT } from '../type-connection-details'
import { flattenAsync } from '../../common/flatten-async'

// TODO: Fix the <any, {}> to be the correct types for props and state
class ModalContent extends PureComponent<any, {}> {
  render() {
    const { uid, remotePairwiseDID } = this.props

    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollViewWrapper}>
          {this.props.content.map((userData, index) => (
            <View key={index} style={styles.wrapper}>
              <View style={styles.textAvatarWrapper}>
                <View style={styles.textWrapper}>
                  <Text style={styles.title}>
                    {userData.label.toLowerCase().endsWith('_link')
                      ? userData.label.slice(0, -5)
                      : userData.label}
                  </Text>
                  <DataRenderer
                    label={userData.label}
                    data={userData.data}
                    uid={uid}
                    remotePairwiseDID={remotePairwiseDID}
                  />
                </View>
                {this.props.showSidePicture && (
                  <View style={styles.avatarWrapper}>
                    <Avatar radius={16} src={{ uri: this.props.imageUrl }} />
                  </View>
                )}
              </View>
              <Border borderColor={'#a5a5a5'} />
            </View>
          ))}
        </ScrollView>
      </View>
    )
  }
}

function DataRenderer(props: {
  label: string,
  data: ?string,
  uid: string,
  remotePairwiseDID: string,
}) {
  const { label, data, uid, remotePairwiseDID } = props

  if (!data) {
    return (
      // Replace empty data string with (none) in lighter gray
      <Text style={styles.contentGray}>{BLANK_ATTRIBUTE_DATA_TEXT}</Text>
    )
  }

  if (label.toLowerCase().endsWith('_link')) {
    // since attribute name ends with "_link"
    // we now know that this is supposed to be an attachment
    // now, we need to render specific icon on the basis of the MIME-type
    let attachment: $PropertyType<
      AttachmentPropType,
      'attachment'
    > | null = null
    try {
      attachment = JSON.parse(data)

      // TODO:KS Harden security check around file extension
      if (
        !attachment['mime-type'] ||
        !attachment.data ||
        !attachment.data.base64 ||
        !attachment.extension ||
        !attachment.name
      ) {
        throw new Error('Invalid data')
      }
    } catch (e) {
      console.log(e.message)
      return <Text style={styles.contentGray}>Error rendering file.</Text>
    }

    // Now we know that we have got attachment data, and all fields are present
    // We can render either photo sent inside data, or we can render icon for file
    if (photoMimeTypes.includes(attachment['mime-type'].toLowerCase())) {
      return <PhotoAttachment base64={attachment.data.base64} />
    }

    return (
      <Attachment
        attachment={attachment}
        uid={uid}
        remotePairwiseDID={remotePairwiseDID}
        label={label}
      />
    )
  }

  return <Text style={styles.content}>{data}</Text>
}

function PhotoAttachment(props: { base64: string }) {
  // TODO:KS handle error condition if image base64 encoded data is not correct
  // and image load fails
  return (
    <Image
      source={{ uri: `${props.base64}` }}
      style={styles.photoAttachment}
      resizeMode="contain"
    />
  )
}

class Attachment extends Component<AttachmentPropType, void> {
  // This component renders icon only and not render content itself
  // ConnectMe is not rendering and opening items inside ConnectMe
  // because it is not safe from security perspective
  // Also, we don't have much time to implement, audio, video, pdf, doc, excel etc.
  // So, for file types whose mime type is known to us, we will render it's icon
  // if mime type matches word doc, then we render word doc icon

  render() {
    const icon = getIcon(this.props.attachment['mime-type'])

    return (
      <TouchableOpacity
        onPress={this.onKnownAttachmentOpen}
        style={styles.nameIconContainer}
      >
        <Image
          source={icon}
          style={styles.attachmentIcon}
          resizeMode="contain"
        />
        <View style={styles.attachmentNameContainer}>
          <Text style={styles.content} ellipsizeMode="tail" numberOfLines={3}>
            {this.props.attachment.name}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  onKnownAttachmentOpen = async () => {
    const {
      uid,
      remotePairwiseDID,
      label,
      attachment: { extension, data: { base64 } },
    } = this.props
    // create file path with DocumentDirectory, uid, remotePairwiseDID and label
    const attachmentPath = `${
      RNFetchBlob.fs.dirs.DocumentDir
    }/${remotePairwiseDID}-${uid}-${label}.${extension}`
    // check if file exists
    const [existError, exists] = await flattenAsync(RNFetchBlob.fs.exists)(
      attachmentPath
    )
    if (existError) {
      Alert.alert('CO001: Error opening file.')
    }
    if (!exists) {
      // if file does not exist writeFile
      const [writeError, writeResult] = await flattenAsync(
        RNFetchBlob.fs.writeFile
      )(attachmentPath, base64, 'base64')

      if (writeError) {
        Alert.alert('CO002: Error opening file.')
      }
    }

    // Use file viewer to open file
    const [openError, openSuccess] = await flattenAsync(FileViewer.open)(
      attachmentPath,
      {
        displayName: `${label}.${extension}`,
        showOpenWithDialog: true,
        showAppsSuggestions: true,
      }
    )
    if (openError) {
      Alert.alert(
        'CO003: Error opening file.',
        `Please install an application which can handle .${extension}`
      )
    }
  }
}

function getIcon(mimeType: string) {
  switch (true) {
    case docMimeTypes.includes(mimeType):
      return require('../../images/docx_icon.png')
    case excelMimeTypes.includes(mimeType):
      return require('../../images/xlsx_icon.png')
    case pptMimeTypes.includes(mimeType):
      return require('../../images/ppt_icon.png')
    case pdfMimeTypes.includes(mimeType):
      return require('../../images/pdf_icon.png')
    case audioVideoMimeType.includes(mimeType):
      return require('../../images/audio_icon.png')
    default:
      return require('../../images/unknown_icon.png')
  }
}

// MIME-TYPES for different file types
const photoMimeTypes = ['image/jpeg', 'image/png', 'image/jpg']
// TODO:KS these file types can be dangerous for a user to open on their device
// what should we do to mitigate risk?
const docMimeTypes = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
  'application/vnd.ms-word.document.macroEnabled.12',
  'application/vnd.ms-word.template.macroEnabled.12',
]
const excelMimeTypes = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
  'application/vnd.ms-excel.sheet.macroEnabled.12',
  'application/vnd.ms-excel.template.macroEnabled.12',
  'application/vnd.ms-excel.addin.macroEnabled.12',
  'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
]
const pptMimeTypes = [
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.presentationml.template',
  'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
  'application/vnd.ms-powerpoint.addin.macroEnabled.12',
  'application/vnd.ms-powerpoint.presentation.macroEnabled.12',
  'application/vnd.ms-powerpoint.template.macroEnabled.12',
  'application/vnd.ms-powerpoint.slideshow.macroEnabled.12',
]
const pdfMimeTypes = ['application/pdf']
const audioVideoMimeType = ['audio/mp4', 'audio/mpeg', 'audio/mp3', 'video/mp4']

type AttachmentPropType = {
  attachment: {
    'mime-type': string,
    data: {
      base64: string,
    },
    extension: string,
    name: string,
  },
  uid: string,
  remotePairwiseDID: string,
  label: string,
}

export { ModalContent }

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
  },
  scrollViewWrapper: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  wrapper: {
    backgroundColor: '#f2f2f2',
    width: '90%',
    marginLeft: '5%',
    paddingTop: 12,
    position: 'relative',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#a5a5a5',
    width: '100%',
    textAlign: 'left',
    marginBottom: 2,
    fontFamily: 'Lato',
  },
  content: {
    fontSize: 17,
    fontWeight: '400',
    color: '#505050',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'Lato',
  },
  contentGray: {
    fontSize: 17,
    fontWeight: '400',
    color: '#a5a5a5',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'Lato',
  },
  textAvatarWrapper: {
    width: '98.5%',
    flexDirection: 'row',
  },
  textWrapper: {
    width: '85%',
    paddingBottom: 12,
  },
  avatarWrapper: {
    width: '15%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAttachment: {
    width: 150,
    height: 150,
  },
  attachmentIcon: {
    width: 64,
    height: 64,
  },
  nameIconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentNameContainer: {
    flex: 1,
    marginLeft: 10,
  },
})
