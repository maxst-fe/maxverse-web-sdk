# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.0.1](https://github.com/maxst-fe/maxverse-web-sdk/compare/@maxverse/media-web-sdk@3.0.0...@maxverse/media-web-sdk@3.0.1) (2023-07-07)


### Features

* add class Presenter for finds targeted participant in the room ([09e84ea](https://github.com/maxst-fe/maxverse-web-sdk/commit/09e84ea01aae8591f720b93f19bde780a92d5a08))
* **helper/dataChannelContainer:** add dataChannelContainer for handles data messages ([c0b57fc](https://github.com/maxst-fe/maxverse-web-sdk/commit/c0b57fc85df0238b6b3508c94033d8610c25d4b3))
* **helper/dataChannelContainer:** add dataChannelContainer for handles data messages ([c4b0c67](https://github.com/maxst-fe/maxverse-web-sdk/commit/c4b0c674c6be67408471291de96f6797aa7584be))





# [3.0.0](https://github.com/maxst-fe/maxverse-web-sdk/compare/@maxverse/media-web-sdk@2.0.0...@maxverse/media-web-sdk@3.0.0) (2023-07-06)


### Features

* add features of screen sharing ([ca9bfd4](https://github.com/maxst-fe/maxverse-web-sdk/commit/ca9bfd4e0e2fb3f2a1f7a14beaf7720a9e7e259c)), closes [#7](https://github.com/maxst-fe/maxverse-web-sdk/issues/7)
* add local track's  method of handle screen sharing ([9e98cf4](https://github.com/maxst-fe/maxverse-web-sdk/commit/9e98cf4ca2321df928ad79802068801729a1c607))
* change types of participant event handlers ([3d0a516](https://github.com/maxst-fe/maxverse-web-sdk/commit/3d0a516d350800e1ecdbbdd57335b18aaae6201e)), closes [#7](https://github.com/maxst-fe/maxverse-web-sdk/issues/7)
* **participant/eventContainer:** add conditional case for screen share ([f1d2b10](https://github.com/maxst-fe/maxverse-web-sdk/commit/f1d2b105935c233e429baaa973f7baaa3b86da65))
* **participant/targetParticipant:** add a getter for isScreenShareEnabled in the TargetParticipant ([39cb40e](https://github.com/maxst-fe/maxverse-web-sdk/commit/39cb40e4bb205514454c03c14fb8abb003ecec3e)), closes [#7](https://github.com/maxst-fe/maxverse-web-sdk/issues/7)
* **types/index.ts:** add types of participant event handler for screen sharing ([acea71b](https://github.com/maxst-fe/maxverse-web-sdk/commit/acea71b45d924e880c972b8112efca67c4da83bf))


### BREAKING CHANGES

* Change method related to control track

- Change the following targetParticipant method
 - attachTrackToElement
 - detachTrackFromElement

Please update your code to remove usages of these elements as they are no longer supported.
Refer to the documentation(https://doc.maxverse.io/maxverse-sdk-media) for migration instructions.
* Deprecated handlers related to types of OnLocalTrackPublished, OnTrackSubscribed

- Change the following participant event handler:
 - onLocalVideoTrackPublished => onLocalVideoUpdated
 - onLocalAudioTrackPublished => onLocalAudioUpdated
 - onVideoTrackSubscribed => onRemoteVideoUpdated
 - onAudioTrackSubscribed => onRemoteAudioUpdated

Please update your code to remove usages of these elements  as they are no longer supported.
Refer to the documentation for migration instructions.





# [2.0.0](https://github.com/maxst-fe/maxverse-web-sdk/compare/@maxverse/media-web-sdk@1.0.0...@maxverse/media-web-sdk@2.0.0) (2023-07-04)


### Features

* **app:** delete unnecessary method of get participant info ([aaa4fb3](https://github.com/maxst-fe/maxverse-web-sdk/commit/aaa4fb35057426563184e407bee44094c66e7e4a)), closes [#2](https://github.com/maxst-fe/maxverse-web-sdk/issues/2)
* **participant/eventContainer:** delete initializeCurrentParticipantStatus method ([2e37bcb](https://github.com/maxst-fe/maxverse-web-sdk/commit/2e37bcba35fe65e77546eba1f72240d717b19657)), closes [#4](https://github.com/maxst-fe/maxverse-web-sdk/issues/4)
* **participant/eventContainer:** delete params/method in participantEventContainer ([f0b32e7](https://github.com/maxst-fe/maxverse-web-sdk/commit/f0b32e7adea1b4c9c780f7401f0a24912b91a791)), closes [#4](https://github.com/maxst-fe/maxverse-web-sdk/issues/4)
* **participant/targetParticipant:** delete unnecessary conditional case ([fdf5160](https://github.com/maxst-fe/maxverse-web-sdk/commit/fdf5160ba2589be500eb3b6af5364905fe4efc03))
* **participant/targetParticipant:** fix methods that control track ([0281239](https://github.com/maxst-fe/maxverse-web-sdk/commit/0281239fe588f9e1f06d9eab7ecd0e162ddbb4fd)), closes [#4](https://github.com/maxst-fe/maxverse-web-sdk/issues/4)
* **participant/targetParticipant:** implement participantFactory ([84a4ecf](https://github.com/maxst-fe/maxverse-web-sdk/commit/84a4ecf3beaf7cef707bf495abfa103608a114a3)), closes [#2](https://github.com/maxst-fe/maxverse-web-sdk/issues/2)
* **participant/targetParticipant:** wrap participant instance to targetParticipant class ([5c77175](https://github.com/maxst-fe/maxverse-web-sdk/commit/5c7717577a398109fbf239e553c4fd0ac1f87697)), closes [#2](https://github.com/maxst-fe/maxverse-web-sdk/issues/2)
* **room/eventContainer:** change params of (dis)connected event handler ([b732150](https://github.com/maxst-fe/maxverse-web-sdk/commit/b732150a1cf9e0ba49dfd784e159747e9cf2cc34))
* **room/eventContainer:** delete unnecessary params/method in room ([e8f4aae](https://github.com/maxst-fe/maxverse-web-sdk/commit/e8f4aae277091034088a77784799ed73d309f0fd)), closes [#4](https://github.com/maxst-fe/maxverse-web-sdk/issues/4)
* switch prev params to targetParticipant ([9b64214](https://github.com/maxst-fe/maxverse-web-sdk/commit/9b64214f5dad8a0ce31fd792f57e6acd22874f46))


### BREAKING CHANGES

* **participant/eventContainer:** participant event handler's parameters deprecation

- Deprecate the following parameters in the participant event handler:
  - sid
  - isLocalParticipant
  - isMuted
  - attachTrack
  - switchTrack

Please update your code to remove usages of these parameters as they are no longer supported.
Refer to the documentation for migration instructions.
* **participant/eventContainer:** liveRoom's method of initializeCurrentParticipantStatus deprecation

 - Deprecate the following method in the LiveRoom:
      -  initializeCurrentParticipantStatus

Please update your code to remove usages of these methods as they are no longer supported.
Refer to the documentation for migration instructions.
* **room/eventContainer:** room event handler's parameters deprecation

- Deprecate the following parameters in the room event handler:
  -  sid
  -  isLocalParticipant
  -  participantDeviceReadyStatus

Please update your code to remove usages of these parameters as they are no longer supported.
Refer to the documentation for migration instructions.





# 1.0.0 (2023-06-28)


### Features

* **packages/media:** add media web sdk package ([9a068ba](https://github.com/maxst-fe/maxverse-web-sdk/commit/9a068bab6aa72faa1ced01025ea57177a79b83db))
