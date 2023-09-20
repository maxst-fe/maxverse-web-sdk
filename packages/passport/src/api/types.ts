export interface TokenBody {
  token: string;
  refresh_token: string;
  id_token: string;
  expires_in: string;
  refresh_expires_in: string;
  token_type: string;
  session_state: string;
  scope: string;
}
