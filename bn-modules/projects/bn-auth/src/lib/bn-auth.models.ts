export interface BoatnetUser {
  username: string;
  roles: string[];
  couchDBInfo: {
    urlRoot: string;
    userDB: string;
    readonlyDB: string;
  };
}

export interface LoginResult {
  user?: BoatnetUser;
  error?: string;
}
