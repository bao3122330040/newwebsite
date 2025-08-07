// index.js
// Main configuration exports

const environment = require('./environment');
const config = require('./config');
const database = require('./database');
const constants = require('./constants');

module.exports = {
  environment,
  config,
  database,
  constants,
  
  // Convenience exports
  env: environment.env,
  isDevelopment: environment.isDevelopment,
  isProduction: environment.isProduction,
  isTest: environment.isTest,
  
  // Quick access to commonly used configs
  port: config.server.port,
  cors: config.security.cors,
  jwt: config.jwt,
  api: config.api,
  
  // Status codes and constants
  HTTP_STATUS: constants.HTTP_STATUS,
  ERROR_CODES: constants.ERROR_CODES,
  USER_ROLES: constants.USER_ROLES
};