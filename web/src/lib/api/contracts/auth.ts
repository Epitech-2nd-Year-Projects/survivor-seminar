import { mapUser, type User, type UserDTO } from "./users";

export type AuthTokenPairDTO = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
};

export type AuthTokenPair = {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
};

export type AuthDTO = {
  tokens: AuthTokenPairDTO;
  user: UserDTO;
};

export type Auth = {
  tokens: AuthTokenPair;
  user: User;
};

export const mapAuthTokenPair = (dto: AuthTokenPairDTO): AuthTokenPair => ({
  accessToken: dto.access_token,
  expiresIn: dto.expires_in,
  refreshToken: dto.refresh_token,
});

export const mapAuth = (dto: AuthDTO): Auth => ({
  tokens: mapAuthTokenPair(dto.tokens),
  user: mapUser(dto.user),
});
