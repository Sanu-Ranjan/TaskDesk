const COOKIE = {
  development: () => ({
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  }),
  production: () => ({
    httpOnly: true,
    secure: true,
    sameSite: "none",
    domain: ".devranjan.cloud",
    path: "/",
  }),
};

module.exports = COOKIE[process.env.NODE_ENV || "development"]();
