class GenericResponseError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function throwError(message, code = 400) {
  throw new GenericResponseError(code, message);
}

const sendSuccess = (response, data = {}, message = "success", code = 200) => {
  const resp = {
    status: "SUCCESS",
    message,
    data,
  };
  return response.status(code).json(resp);
};

const sendError = (response, error) => {
  const resp = {
    status: "FAILURE",
    message: error.message,
  };
  return response.status(error.code || 400).json(resp);
};

module.exports = {
  throwError,
  sendError,
  sendSuccess,
};
