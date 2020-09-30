// @flow
import React, { Fragment } from 'react'
import SvgIcon from 'react-native-svg-icon'
import { Path, Ellipse } from 'react-native-svg'

export const svgIcons = {
  UserAvatar: {
    svg: (
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M.417 42.487c.334-.783.88-1.47 1.637-2.06.64-.497.81-1.288.995-2.15.242-1.13.511-2.383 1.904-3.26 1.49-.936 4.422-1.41 6.673-1.775 1.458-.236 2.63-.426 2.937-.665.175-.136.561-.29 1.043-.48.594-.236 1.333-.53 2.003-.92.269-.156.613-.556 1.031-1.198v-2.236c-1.35-1.733-2.024-2.968-2.024-3.705v-1.874c-.82.255-1.366-.11-1.641-1.096-.275-.986-.412-2.454-.412-4.403.202-.594.202-.995 0-1.205-.304-.314-.716-2.168-.51-2.718.137-.366.206-.976.206-1.829-.27-.6-.404-1.016-.404-1.245 0-.084-.012-.25-.027-.46-.046-.655-.123-1.744.027-2.155.198-.542 2.195-5.693 8.167-6.205 3.982-.342 6.995-.2 9.042.423 1.684 1.31 2.526 2.214 2.526 2.71 0 .498.085.841.255 1.032 1.612.898 2.47 1.93 2.574 3.094.154 1.748.044 4.723-.251 5.374-.295.652-.497 2.647-.497 3.184 0 .537-.133 2.921-.395 3.747-.054.172-.096.322-.134.457-.144.511-.227.806-.7 1.295-.398.41-.859.5-1.381.266-.089.739-.193 1.378-.312 1.919-.334 1.51-1.613 3.394-1.685 3.394-.114 0-.114.848 0 2.545h1.352c.703.413 1.379.842 2.026 1.287.648.446 1.223.446 1.726 0 2.362.365 3.91.699 4.646 1.002.663.274 1.43 1.668 2.137 2.95.467.848.907 1.647 1.273 2.043.612.662 1.644 1.22 3.096 1.675 1.12 1.164 1.806 2.325 2.06 3.482C43.515 49.621 34.777 53.995 25.017 54h-.032c-9.873-.005-18.7-4.48-24.567-11.513z"
        fill="#6D6464"
      />
    ),
    viewBox: '0 0 50 54',
  },
  TokenIcon: {
    svg: (
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20 10c0 5.523-4.477 10-10 10S0 15.523 0 10 4.477 0 10 0s10 4.477 10 10zm-1.667 0a8.333 8.333 0 1 1-16.666 0 8.333 8.333 0 0 1 16.666 0zM5.653 7.499c-.598-.187-1.237.127-1.43.698-.194.573.131 1.187.727 1.373a1.154 1.154 0 0 0 1.35-.52l1.94.604c.027-.127.068-.248.121-.362L6.423 8.69a1.087 1.087 0 0 0-.77-1.191zM4.95 10.43c-.596.186-.921.8-.727 1.372.193.572.832.887 1.43.7.528-.165.843-.667.773-1.178l1.937-.61a1.671 1.671 0 0 1-.122-.361l-1.935.609a1.154 1.154 0 0 0-1.356-.532zm3.064 4.05a1.166 1.166 0 0 1-1.585.24 1.061 1.061 0 0 1-.25-1.521 1.163 1.163 0 0 1 1.424-.334l1.191-1.585c.098.085.205.16.32.223L7.92 13.09c.37.373.42.957.094 1.388zm3.973-8.958a1.164 1.164 0 0 1 1.583-.241 1.06 1.06 0 0 1 .252 1.52 1.163 1.163 0 0 1-1.425.335L11.206 8.72a1.826 1.826 0 0 0-.32-.223L12.08 6.91a1.054 1.054 0 0 1-.094-1.388zm3.062 4.048c.596-.186.922-.8.728-1.373-.193-.571-.833-.885-1.429-.698a1.087 1.087 0 0 0-.773 1.177l-1.94.61c.056.114.097.235.124.361l1.935-.608c.252.463.821.697 1.355.531zm-.7 2.933c.595.186 1.235-.13 1.428-.7.194-.573-.132-1.187-.728-1.373a1.153 1.153 0 0 0-1.348.52l-1.94-.603a1.654 1.654 0 0 1-.122.362l1.938.601a1.087 1.087 0 0 0 .771 1.193zm-.527.696a1.061 1.061 0 0 1-.252 1.52 1.165 1.165 0 0 1-1.584-.24 1.056 1.056 0 0 1 .104-1.398l-1.198-1.582c.115-.063.222-.138.319-.224l1.199 1.583a1.165 1.165 0 0 1 1.412.34zm-2.688-7.943c0-.603-.508-1.09-1.134-1.09-.627 0-1.134.487-1.134 1.09 0 .537.404.982.936 1.072v1.957a1.75 1.75 0 0 1 .396 0V6.328c.532-.09.936-.535.936-1.072zm0 9.49c0-.538-.404-.983-.936-1.073v-1.957a1.848 1.848 0 0 1-.396 0v1.957c-.532.09-.936.535-.936 1.072 0 .602.507 1.088 1.134 1.088.627 0 1.134-.486 1.134-1.088zM8.866 10c0-.602.508-1.09 1.134-1.09.626 0 1.133.488 1.133 1.09 0 .602-.506 1.088-1.133 1.089-.627-.001-1.134-.487-1.134-1.09zM6.178 6.8a1.06 1.06 0 0 1 .252-1.52 1.164 1.164 0 0 1 1.583.24c.33.436.275 1.027-.104 1.4L9.108 8.5a1.8 1.8 0 0 0-.319.224l-1.2-1.583a1.164 1.164 0 0 1-1.41-.34z"
        fill="#EB9B2D"
      />
    ),
    viewBox: '0 0 20 20',
  },
  About: {
    svg: (
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14 .667C6.64.667.667 6.64.667 14S6.64 27.333 14 27.333 27.333 21.36 27.333 14 21.36.667 14 .667zm-1.334 6.666V10h2.667V7.333h-2.667zm0 5.333v8h2.667v-8h-2.667zM3.333 14c0 5.88 4.787 10.666 10.667 10.666S24.666 19.88 24.666 14C24.666 8.12 19.88 3.333 14 3.333 8.12 3.333 3.333 8.12 3.333 14z"
        fill="#777"
      />
    ),
    viewBox: '0 0 28 28',
  },
  Chat: {
    svg: (
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M27.32 3.333A2.663 2.663 0 0 0 24.666.667H3.334A2.675 2.675 0 0 0 .667 3.333v16C.667 20.8 1.867 22 3.333 22H22l5.333 5.333-.013-24zm-2.654 0v17.56l-1.56-1.56H3.334v-16h21.334zM22 14H6v2.666h16V14zM6 10h16v2.666H6V10zm16-4H6v2.666h16V6z"
        fill="#777"
      />
    ),
    viewBox: '0 0 28 28',
  },
  Passcode: {
    svg: (
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21.333 19.333h8V14H32V6H17.76A9.34 9.34 0 0 0 9.333.667C4.187.667 0 4.853 0 10c0 5.146 4.187 9.333 9.333 9.333A9.326 9.326 0 0 0 17.76 14h3.573v5.333zm5.334-2.666H24v-5.334h-8.08l-.307.893a6.673 6.673 0 0 1-6.28 4.44A6.67 6.67 0 0 1 2.667 10a6.67 6.67 0 0 1 6.666-6.667 6.673 6.673 0 0 1 6.28 4.44l.307.893h13.413v2.667h-2.666v5.333zM9.333 14c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zM8 10c0-.733.6-1.334 1.333-1.334.734 0 1.334.6 1.334 1.334 0 .733-.6 1.333-1.334 1.333C8.6 11.333 8 10.733 8 10z"
        fill="#777"
      />
    ),
    viewBox: '0 0 32 20',
  },
  Biometrics: {
    svg: (
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.753 3.96a.62.62 0 0 1-.306-.08C16.887 2.56 14.673 2 12.02 2c-2.64 0-5.147.627-7.427 1.88a.678.678 0 0 1-.906-.267.675.675 0 0 1 .266-.906c2.48-1.347 5.2-2.04 8.067-2.04 2.84 0 5.32.626 8.04 2.026a.653.653 0 0 1 .28.893.654.654 0 0 1-.587.374zm-19.08 7a.665.665 0 0 1-.547-1.053c1.32-1.867 3-3.334 5-4.36 4.187-2.16 9.547-2.174 13.747-.014 2 1.027 3.68 2.48 5 4.333a.667.667 0 0 1-.16.934.665.665 0 0 1-.933-.16c-1.2-1.68-2.72-3-4.52-3.92-3.827-1.96-8.72-1.96-12.533.013C3.913 7.667 2.393 9 1.193 10.68a.581.581 0 0 1-.52.28zM8.54 26.853c.12.133.293.2.467.2a.731.731 0 0 0 .493-.2.685.685 0 0 0 0-.947c-1.027-1.04-1.613-1.693-2.467-3.226-.813-1.44-1.24-3.213-1.24-5.133 0-3.227 2.787-5.854 6.214-5.854 3.426 0 6.213 2.627 6.213 5.854a.66.66 0 0 0 .667.666.66.66 0 0 0 .666-.666c0-3.96-3.386-7.187-7.546-7.187S4.46 13.586 4.46 17.547c0 2.146.48 4.146 1.4 5.786.893 1.614 1.52 2.36 2.68 3.52zm10.027-2.267c-1.587 0-2.987-.4-4.134-1.186-1.986-1.347-3.173-3.534-3.173-5.853a.66.66 0 0 1 .667-.667.66.66 0 0 1 .666.667c0 1.88.96 3.653 2.587 4.746.947.64 2.053.947 3.387.947.32 0 .853-.04 1.386-.133a.665.665 0 0 1 .774.546.665.665 0 0 1-.547.774c-.76.146-1.427.16-1.613.16zm-2.854 2.72c.054.014.12.027.174.027.28 0 .56-.2.626-.506a.662.662 0 0 0-.466-.814c-1.88-.52-3.094-1.213-4.36-2.466a8.396 8.396 0 0 1-2.494-6.014c0-1.427 1.24-2.587 2.774-2.587 1.533 0 2.773 1.16 2.773 2.587 0 2.16 1.84 3.92 4.107 3.92 2.266 0 4.106-1.76 4.106-3.92 0-5.76-4.933-10.44-11-10.44-4.306 0-8.24 2.414-10.013 6.133-.6 1.267-.907 2.72-.907 4.32 0 1.8.32 3.534.974 5.28.12.334.506.52.853.387a.65.65 0 0 0 .387-.853c-.8-2.133-.894-3.773-.894-4.813 0-1.387.267-2.654.787-3.734C4.7 10.546 8.167 8.44 11.953 8.44c5.334 0 9.667 4.08 9.667 9.107 0 1.426-1.24 2.586-2.773 2.586-1.534 0-2.774-1.16-2.774-2.586 0-2.16-1.84-3.92-4.106-3.92-2.267 0-4.107 1.76-4.107 3.92a9.729 9.729 0 0 0 2.893 6.96c1.454 1.426 2.84 2.213 4.96 2.8z"
        fill="#777"
      />
    ),
    viewBox: '0 0 24 28',
  },
  Backup: {
    svg: (
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.667 0h16L24 5.333v16C24 22.8 22.8 24 21.333 24H2.667C1.187 24 0 22.8 0 21.333V2.667A2.666 2.666 0 0 1 2.667 0zm18.666 21.333V6.44L17.56 2.667H2.667v18.666h18.666zM12 12c-2.213 0-4 1.787-4 4s1.787 4 4 4 4-1.787 4-4-1.787-4-4-4zm4-8H4v5.333h12V4z"
        fill="#777"
      />
    ),
    viewBox: '0 0 24 24',
  },
  CloudBackup: {
    svg: (
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.123 5.72A10.01 10.01 0 0 1 16 .333c4.851 0 8.89 3.454 9.809 8.054 3.452.24 6.184 3.093 6.184 6.613a6.668 6.668 0 0 1-6.664 6.667H8.003c-4.411 0-7.997-3.587-7.997-8 0-4.12 3.119-7.52 7.117-7.947zm16.074 3.187C22.517 5.48 19.478 3 16 3a7.273 7.273 0 0 0-6.49 3.96l-.667 1.267-1.426.146c-2.706.28-4.745 2.56-4.745 5.294A5.33 5.33 0 0 0 8.003 19h17.326c2.2 0 3.998-1.8 3.998-4 0-2.066-1.626-3.8-3.705-3.947l-2.026-.146-.4-2z"
        fill="#777"
      />
    ),
    viewBox: '0 0 32 22',
  },
  Recovery: {
    svg: (
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.666.333H3.333A2.675 2.675 0 0 0 .667 3v24c0 1.467 1.2 2.667 2.666 2.667h13.334c1.466 0 2.666-1.2 2.666-2.667V3c0-1.466-1.2-2.667-2.666-2.667zM14 19c0 .733-.6 1.334-1.334 1.334H7.333C6.6 20.334 6 19.733 6 19v-4c0-.733.6-1.333 1.333-1.333v-1.333a2.666 2.666 0 1 1 5.333 0v1.333c.734 0 1.334.6 1.334 1.333v4zm-4-8.267c-.88 0-1.6.72-1.6 1.6v1.334h3.2v-1.333c0-.88-.72-1.6-1.6-1.6zm-6.667 13.6h13.334V5.668H3.332v18.666z"
        fill="#777"
      />
    ),
    viewBox: '0 0 20 30',
  },

  ViewPassPhrase: {
    svg: (
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22.6665 1.3335H9.33317C7.8665 1.3335 6.6665 2.5335 6.6665 4.00016V28.0002C6.6665 29.4668 7.8665 30.6668 9.33317 30.6668H22.6665C24.1332 30.6668 25.3332 29.4668 25.3332 28.0002V4.00016C25.3332 2.5335 24.1332 1.3335 22.6665 1.3335ZM19.9998 20.0002C19.9998 20.7335 19.3998 21.3335 18.6665 21.3335H13.3332C12.5998 21.3335 11.9998 20.7335 11.9998 20.0002V16.0002C11.9998 15.2668 12.5998 14.6668 13.3332 14.6668V13.3335C13.3332 11.8668 14.5198 10.6668 15.9998 10.6668C17.4665 10.6668 18.6665 11.8535 18.6665 13.3335V14.6668C19.3998 14.6668 19.9998 15.2668 19.9998 16.0002V20.0002ZM15.9998 11.7335C15.1198 11.7335 14.3998 12.4535 14.3998 13.3335V14.6668H17.5998V13.3335C17.5998 12.4535 16.8798 11.7335 15.9998 11.7335ZM9.33317 25.3335H22.6665V6.66683H9.33317V25.3335Z"
        fill="#777"
      />
    ),
    viewBox: '0 0 32 32',
  },
  PaymentToken: {
    svg: (
      <Path
        d="M10.761,20C16.459,20 21.078,15.523 21.078,10C21.078,4.477 16.459,0 10.761,0C5.063,0 0.444,4.477 0.444,10C0.444,15.523 5.063,20 10.761,20ZM5.168,6.881C4.4,6.649 3.578,7.04 3.329,7.752C3.08,8.466 3.499,9.232 4.265,9.464C4.562,9.554 4.867,9.55 5.143,9.471C5.766,9.293 6.439,8.948 7.059,9.135L8.277,9.502C8.395,9.538 8.518,9.464 8.558,9.347C8.601,9.223 8.539,9.083 8.414,9.046L7.223,8.687C6.614,8.504 6.273,7.819 5.863,7.333C5.691,7.129 5.454,6.968 5.168,6.881ZM4.265,10.536C3.499,10.768 3.08,11.534 3.329,12.247C3.578,12.96 4.4,13.352 5.168,13.12C5.451,13.034 5.686,12.876 5.858,12.674C6.269,12.192 6.61,11.515 7.215,11.33L8.418,10.963C8.543,10.925 8.603,10.785 8.561,10.662C8.52,10.545 8.397,10.471 8.278,10.507L7.072,10.875C6.451,11.064 5.776,10.716 5.154,10.533C4.874,10.451 4.566,10.446 4.265,10.536ZM8.206,15.584C7.732,16.191 6.819,16.325 6.168,15.884C5.516,15.443 5.371,14.594 5.845,13.988C6.043,13.735 6.317,13.564 6.617,13.482C7.23,13.317 7.954,13.216 8.343,12.714L9.067,11.779C9.145,11.679 9.289,11.664 9.394,11.736C9.508,11.814 9.544,11.973 9.459,12.083L8.744,13.005C8.369,13.489 8.5,14.207 8.484,14.819C8.478,15.085 8.387,15.352 8.206,15.584ZM13.316,4.417C13.789,3.809 14.703,3.676 15.353,4.116C16.006,4.557 16.15,5.406 15.676,6.013C15.479,6.266 15.205,6.437 14.905,6.518C14.292,6.684 13.568,6.786 13.178,7.288L12.454,8.221C12.376,8.322 12.233,8.337 12.128,8.266C12.014,8.187 11.977,8.027 12.063,7.917L12.778,6.995C13.153,6.512 13.022,5.795 13.037,5.184C13.043,4.917 13.134,4.649 13.316,4.417ZM17.256,9.464C18.022,9.232 18.442,8.466 18.192,7.752C17.943,7.04 17.121,6.649 16.354,6.881C16.07,6.967 15.835,7.126 15.663,7.328C15.253,7.809 14.913,8.485 14.308,8.67L13.104,9.037C12.979,9.075 12.918,9.215 12.961,9.339C13.001,9.456 13.124,9.53 13.242,9.494L14.451,9.125C15.071,8.937 15.745,9.284 16.366,9.467C16.646,9.55 16.955,9.555 17.256,9.464ZM16.354,13.12C17.121,13.352 17.943,12.96 18.192,12.247C18.442,11.534 18.022,10.768 17.256,10.536C16.959,10.447 16.654,10.45 16.377,10.53C15.755,10.708 15.084,11.052 14.464,10.866L13.245,10.499C13.126,10.463 13.003,10.537 12.963,10.654C12.921,10.778 12.982,10.918 13.107,10.956L14.299,11.314C14.908,11.497 15.249,12.182 15.658,12.668C15.831,12.873 16.068,13.033 16.354,13.12ZM15.676,13.988C16.15,14.594 16.005,15.443 15.353,15.884C14.703,16.325 13.789,16.191 13.315,15.584C13.132,15.348 13.041,15.076 13.037,14.806C13.028,14.193 13.162,13.473 12.784,12.99L12.071,12.078C11.986,11.969 12.021,11.809 12.135,11.731C12.239,11.659 12.383,11.673 12.461,11.773L13.198,12.716C13.587,13.213 14.303,13.316 14.912,13.485C15.209,13.567 15.48,13.737 15.676,13.988ZM12.219,4.085C12.219,3.334 11.567,2.727 10.761,2.727C9.955,2.727 9.302,3.334 9.302,4.085C9.302,4.398 9.415,4.686 9.606,4.915C9.995,5.383 10.506,5.868 10.506,6.476L10.506,7.607C10.506,7.743 10.624,7.849 10.76,7.849C10.896,7.849 11.015,7.743 11.015,7.607L11.015,6.476C11.015,5.868 11.526,5.383 11.915,4.916C12.106,4.686 12.219,4.399 12.219,4.085ZM12.219,15.916C12.219,15.604 12.107,15.317 11.917,15.088C11.528,14.618 11.015,14.131 11.015,13.521L11.015,12.394C11.015,12.258 10.897,12.152 10.76,12.152C10.624,12.152 10.506,12.257 10.506,12.394L10.506,13.521C10.506,14.131 9.993,14.618 9.604,15.089C9.415,15.318 9.302,15.604 9.302,15.916C9.302,16.667 9.955,17.273 10.761,17.273C11.567,17.273 12.219,16.667 12.219,15.916ZM9.302,10.001C9.302,9.25 9.955,8.642 10.761,8.642C11.566,8.642 12.219,9.25 12.219,10.001C12.219,10.751 11.567,11.358 10.761,11.359C9.955,11.358 9.302,10.751 9.302,10.001ZM5.845,6.013C5.371,5.406 5.516,4.557 6.168,4.116C6.819,3.676 7.732,3.809 8.205,4.417C8.39,4.652 8.48,4.924 8.484,5.195C8.493,5.808 8.36,6.529 8.737,7.012L9.45,7.923C9.535,8.032 9.5,8.191 9.386,8.27C9.282,8.342 9.138,8.328 9.061,8.228L8.324,7.286C7.934,6.788 7.217,6.685 6.607,6.516C6.311,6.434 6.041,6.264 5.845,6.013Z"
        fill="#fff"
      />
    ),
    viewBox: '0 0 21 20',
  },
  ErrorFace: {
    svg: (
      <Path
        d="M19.98 0C8.94 0 0 8.96 0 20C0 31.04 8.94 40 19.98 40C31.04 40 40 31.04 40 20C40 8.96 31.04 0 19.98 0ZM20 36C11.16 36 4 28.84 4 20C4 11.16 11.16 3.99999 20 3.99999C28.84 3.99999 36 11.16 36 20C36 28.84 28.84 36 20 36ZM27 18C28.66 18 30 16.66 30 15C30 13.34 28.66 12 27 12C25.34 12 24 13.34 24 15C24 16.66 25.34 18 27 18ZM13 18C14.66 18 16 16.66 16 15C16 13.34 14.66 12 13 12C11.34 12 10 13.34 10 15C10 16.66 11.34 18 13 18ZM19.9874 22.3256C23.7991 22.3256 27.0382 24.6635 28.347 27.9302C24.6853 26.062 21.8988 25.1279 19.9874 25.1279C18.1835 25.1279 15.3969 26.062 11.6279 27.9302C12.9366 24.6635 16.1758 22.3256 19.9874 22.3256Z"
        fill="#CE0B24"
      />
    ),
    viewBox: '0 0 40 40',
  },
  SuccessCheckmark: {
    svg: (
      <Fragment>
        <Ellipse cx="20" cy="20" rx="20" ry="20" fill="#86B93B" />
        <Path
          d="M15.8136 25.3364L10.6994 19.8075L10.5159 19.6091L10.3324 19.8075L8.56648 21.7166L8.40945 21.8864L8.56648 22.0561L15.6301 29.6925L15.8136 29.8909L15.9972 29.6925L31.1335 13.3289L31.2906 13.1591L31.1335 12.9893L29.3676 11.0802L29.1841 10.8818L29.0006 11.0802L15.8136 25.3364Z"
          fill="white"
          stroke="white"
          stroke-width="0.5"
        />
      </Fragment>
    ),
    viewBox: '0 0 40 40',
  },
}

export const SvgSettingIcons = (props: {
  name: string,
  fill?: string,
  height?: string,
  width?: string,
}) => {
  const { height = '24', width } = props
  return <SvgIcon {...props} height={height} width={width} svgs={svgIcons} />
}

export default SvgSettingIcons
