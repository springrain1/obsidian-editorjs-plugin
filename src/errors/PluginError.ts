/**
 * Error codes for plugin-specific errors
 */
export enum ErrorCode {
  EDITOR_INIT_FAILED = 'EDITOR_INIT_FAILED',
  FILE_READ_ERROR = 'FILE_READ_ERROR',
  FILE_WRITE_ERROR = 'FILE_WRITE_ERROR',
  CONVERSION_ERROR = 'CONVERSION_ERROR',
  INVALID_BLOCK_TYPE = 'INVALID_BLOCK_TYPE',
  METADATA_PARSE_ERROR = 'METADATA_PARSE_ERROR',
  IMAGE_UPLOAD_ERROR = 'IMAGE_UPLOAD_ERROR'
}

/**
 * Custom error class for plugin errors
 */
export class PluginError extends Error {
  code: ErrorCode;
  originalError?: Error;

  constructor(code: ErrorCode, message: string, originalError?: Error) {
    super(message);
    this.name = 'PluginError';
    this.code = code;
    this.originalError = originalError;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PluginError);
    }
  }
}
