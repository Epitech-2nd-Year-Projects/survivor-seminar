package auth

import (
	"time"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/config"
	"github.com/golang-jwt/jwt/v5"
)

type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
}

type Claims struct {
	UserID uint64 `json:"uid"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	Type   string `json:"typ"`
	jwt.RegisteredClaims
}

func GenerateTokenPair(cfg *config.Config, userID uint64, email, role string) (*TokenPair, error) {
	now := time.Now()
	atExp := now.Add(cfg.Auth.JWT.AccessTokenTTL)
	rtExp := now.Add(cfg.Auth.JWT.RefreshTokenTTL)

	access := jwt.NewWithClaims(jwt.SigningMethodHS256, &Claims{
		UserID: userID,
		Email:  email,
		Role:   role,
		Type:   "access",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(atExp),
			IssuedAt:  jwt.NewNumericDate(now),
		},
	})
	aStr, err := access.SignedString([]byte(cfg.Auth.JWT.Secret))
	if err != nil {
		return nil, err
	}

	refresh := jwt.NewWithClaims(jwt.SigningMethodHS256, &Claims{
		UserID: userID,
		Email:  email,
		Role:   role,
		Type:   "refresh",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(rtExp),
			IssuedAt:  jwt.NewNumericDate(now),
		},
	})
	rStr, err := refresh.SignedString([]byte(cfg.Auth.JWT.Secret))
	if err != nil {
		return nil, err
	}

	return &TokenPair{
		AccessToken:  aStr,
		RefreshToken: rStr,
		ExpiresIn:    int64(cfg.Auth.JWT.AccessTokenTTL.Seconds()),
	}, nil
}

func ParseClaims(cfg *config.Config, tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		return []byte(cfg.Auth.JWT.Secret), nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}
	return nil, jwt.ErrTokenInvalidClaims
}
