module.exports = {
  displayName: '@mono-repo-template/sub',
  setupFilesAfterEnv: ['./jest.setup.ts'],
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.+(js|ts)', '**/?(*.)+(spec|test).+(js|ts)'],
  moduleFileExtensions: ['js', 'ts'],
  transform: {
    '^.+\\.(js)?$': 'babel-jest',
    '^.+\\.(ts)$': 'ts-jest',
  },
  moduleNameMapper: {
    '\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'identity-obj-proxy',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
};
