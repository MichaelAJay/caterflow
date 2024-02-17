export default () => ({
  isLocal: process.env.IS_LOCAL ? process.env.IS_LOCAL === 'true' : false,
  env: process.env.ENV || 'development',
});
