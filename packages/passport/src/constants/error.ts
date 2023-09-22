export const INVALID_ACCESS_SELF_INSTANCE_ERROR = 'Invalid access: PassportClient constructor must be invoked with new';

export const INVALID_ACCESS_SERVER_ENV_ERROR =
  "'Invalid access: PassportClient must be initialized on the client side'";

export const NOT_SET_REDIRECT_URI_ERROR =
  'Redirect URI is required but was not provided. Please ensure to set a redirect URI in at least one place when creating an instance or attempting to log in.';

export const NOT_FOUND_QUERY_PARAMS_ERROR = 'Not found candidate of query params available for parsing';

export const NOT_FOUND_VALID_TRANSACTION = 'Missing valid transaction';

export const NOT_FOUND_VALID_CODE_VERIFIER = 'Not found valid code_verifier to do PKCE for CSRF protection';

export const NOT_FOUND_REFRESH_TOKEN_EXPIRES = 'Not found valid refresh token expires';

export const NOT_FOUND_REFRESH_TOKEN = 'Not found valid refresh token';

export const NOT_FOUND_VALID_DOMAIN = 'Not found valid domain. domain option required';

export const NOT_FOUND_VALID_CLIENT_ID = 'Not found valid clientId. clientId option required';

export const NOT_FOUND_ID_TOKEN = 'Not found valid id token';

export const NOT_FOUND_REFRESH_TOKEN_ENTRY = 'Not found cached refresh token entry';

export const REFRESH_TOKEN_EXPIRED = 'Current refresh token in memory expired. You need to perform re-authentication';

export const AUTHENTICATION_ACCESS_DENIED =
  'Your access request has been denied. Please ensure you have granted the necessary permissions';

export const AUTHENTICATION_INVALID_SCOPE =
  'Your request could not be processed due to an invalid scope. Please verify your scope and resubmit';

export const INVALID_TOKEN_CONTROLLER = 'Valid Token controller is required but was not declare';

export const INVALID_DECODED_ID_TOKEN = 'Current id token could not be decoded';

export const INVALID_BASE64_STRING = 'Base64 string is not of the correct length';

export const INVALID_TOKEN_ROTATION = 'Token rotation is not valid status';

export const REMAIN_PREV_TRANSACTION_INFO = 'Prev transaction info is remained in storage';

export const NOT_AUTHENTICATED_USER = 'Current user is not authenticated. Please do re-authentication process';

export const AUTHORIZATION_CODE_FLOW = 'Currently in code transaction phase, therefore access is not available';

export const INVALID_CACHE_LOCATION = 'Invalid cache location';
