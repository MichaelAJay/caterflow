export default () => ({
  frontendOrigin: process.env.FRONT_END_ORIGIN,
  isLocal: process.env.IS_LOCAL ? process.env.IS_LOCAL === 'true' : false,
  env: process.env.ENV || 'development',
  googleProjectId: process.env.GOOGLE_PROJECT,
  logPath: process.env.LOG_PATH,
  product: process.env.PROJECT || 'caterflow',
  ezCaterApiUrl: process.env.EZ_CATER_API_URL,
  localPathToSecret: {
    // These must follow the naming convention of the system secrets in the cloud-based secret manager
    CATERFLOW_DEV_CIPHER_KEY: process.env.PATH_TO_CIPHER_KEY,
    CATERFLOW_DEV_MONGODB_CONNECTION_URI:
      process.env.PATH_TO_MONGODB_CONNECTION_URI,
  },
});
