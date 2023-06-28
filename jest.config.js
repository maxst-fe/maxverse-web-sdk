module.exports = {
  projects: ['<rootDir>/packages/**/jest.config.js'],
  reporters: ['default', require.resolve('jest-junit')],
};
