function success(data, message = "Success") {
  return { success: true, message, data };
}

function failure(message, error = null) {
  return { success: false, message, error };
}

function dbError(res) {
  return res.status(500).json(failure("database operation failed"));
}

function serverError(res) {
  return res.status(500).json(failure("Internal server error"));
}

module.exports = {
  success,
  failure,
  dbError,
  serverError,
};
