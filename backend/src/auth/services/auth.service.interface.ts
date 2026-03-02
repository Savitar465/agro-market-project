export interface IAuthService {
  signIn(username: string, password: string):  Promise<{ access_token: string }>;
}
