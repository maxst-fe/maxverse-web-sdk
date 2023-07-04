# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
