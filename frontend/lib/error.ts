/**
 * Centralized Safe Error Handler for Livansa Frontend.
 *
 * Ensures that users are NEVER exposed to:
 * - Raw HTTP status codes (400, 401, 403, 404, 409, 422, 429, 500, etc.)
 * - AxiosError / Network Error technical messages
 * - MongoDB / Mongoose errors (CastError, ObjectId, ValidationError, E11000)
 * - JWT errors / internal database leaks
 * - Uncaught exception stack traces
 */

function isTechnicalError(msg: string): boolean {
  if (!msg || typeof msg !== "string") return false;
  const lower = msg.toLowerCase();
  return (
    lower.includes("request failed with status code") ||
    lower.includes("axioserror") ||
    lower.includes("e11000") ||
    lower.includes("cast to objectid") ||
    lower.includes("validationerror") ||
    lower.includes("mongoservererror") ||
    lower.includes("internal server error") ||
    lower.includes("jwt expired") ||
    lower.includes("jwt malformed") ||
    lower.includes("invalid signature") ||
    lower.includes("syntaxerror") ||
    lower.includes("typeerror") ||
    lower.includes("referenceerror") ||
    lower.includes("cannot read properties") ||
    lower.includes("cannot read property") ||
    lower.includes("undefined is not") ||
    lower.includes("node_modules") ||
    lower.includes("stack trace") ||
    lower.includes("cors")
  );
}

export function getSafeErrorMessage(
  error: unknown,
  fallbackMessage: string = "Something went wrong. Please try again."
): string {
  if (!error) return fallbackMessage;

  // Check object structure (Axios or standard error)
  if (typeof error === "object" && error !== null) {
    const obj = error as {
      response?: {
        status?: number;
        data?: {
          message?: string;
          error?: string;
        };
      };
      message?: string;
      code?: string;
    };

    const status = obj.response?.status;
    const rawMsg = obj.response?.data?.message || obj.response?.data?.error;

    // 1. Network / Connection Failures
    if (
      obj.code === "ERR_NETWORK" ||
      obj.code === "ECONNREFUSED" ||
      obj.message === "Network Error" ||
      (typeof obj.message === "string" &&
        obj.message.toLowerCase().includes("network error"))
    ) {
      return "Unable to connect right now. Please check your internet connection and try again.";
    }

    // 2. Specific HTTP Status Code Handling
    if (status === 401) {
      return "Your session has expired. Please log in again.";
    }
    if (status === 403) {
      return "You don't have permission to perform this action.";
    }
    if (status === 404) {
      return "The requested information could not be found.";
    }
    if (status === 409) {
      if (rawMsg && typeof rawMsg === "string" && !isTechnicalError(rawMsg)) {
        return rawMsg;
      }
      return "Something already exists with these details.";
    }
    if (status === 422) {
      return "Please check the information you entered.";
    }
    if (status === 429) {
      return "You're doing that a little too quickly. Please wait a moment and try again.";
    }
    if (status && status >= 500) {
      return "Something went wrong on our side. Please try again later.";
    }

    // 3. Clean operational backend messages for status 400
    if (rawMsg && typeof rawMsg === "string") {
      if (!isTechnicalError(rawMsg)) {
        return rawMsg;
      }
    }
  }

  // 4. String error check
  if (typeof error === "string") {
    if (!isTechnicalError(error)) {
      return error;
    }
  }

  return fallbackMessage;
}
