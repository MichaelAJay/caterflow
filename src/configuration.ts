export default () => ({
  frontendOrigin: process.env.FRONT_END_ORIGIN,
  isLocal: process.env.IS_LOCAL ? process.env.IS_LOCAL === 'true' : false,
  env: process.env.ENV || 'development',
  googleProjectId: process.env.GOOGLE_PROJECT,
  product: process.env.PROJECT || 'caterflow',
});
