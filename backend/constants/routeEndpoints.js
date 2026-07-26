const ROUTE_END = {
  auth: {
    signup: "/signup",
    login: "/login",
    me: "/me",
    logout: "/logout",
  },
  tasks: {
    add: "/",
    getAll: "/",
    update: "/:id",
    delete: "/:id",
  },
};

module.exports = {
  ROUTE_END,
};
