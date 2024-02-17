export default () => ({
  isLocal: process.env.IS_LOCAL ? process.env.IS_LOCAL === 'true' : false,
  env: process.env.ENV || 'development',
  googleProjectId: process.env.GOOGLE_PROJECT,
  product: process.env.PROJECT || 'caterflow',
});
