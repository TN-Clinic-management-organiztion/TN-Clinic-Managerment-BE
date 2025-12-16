export default () => ({
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET,
      accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '1d',
      refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    },
  },
});