// Note that this class acts as a DTO and sits between the use case and
// controller return value.

module.exports = class APIResponse {
  /**
   * @param {number} statusCode
   * @param {*} [data]
   */
  constructor(statusCode, data) {
    this.statusCode = statusCode;
    if (data) {
      this.data = data;
    }
  }

  static internalServerError() {
    return new APIResponse(500, { message: "Internal Server Error" });
  }
};
