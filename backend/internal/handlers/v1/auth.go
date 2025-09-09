package v1

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/auth"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/config"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/database/models"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/notifications/email"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/response"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthHandler struct {
	cfg    *config.Config
	db     *gorm.DB
	log    *logrus.Logger
	mailer email.Mailer
}

func NewAuthHandler(cfg *config.Config, db *gorm.DB, log *logrus.Logger, mailer email.Mailer) *AuthHandler {
	return &AuthHandler{cfg: cfg, db: db, log: log, mailer: mailer}
}

// Register godoc
// @Summary      Sign up
// @Description  Creates a user, sends a verification email, and returns the profile. No tokens are returned; cookies are set after login.
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param        payload body requests.AuthRegisterRequest true "Registration data" Example({"email":"john@doe.tld","name":"John Doe","role":"founder","password":"secret123"})
// @Success      201 {object} response.AuthRegisterResponse
// @Failure      400 {object} response.ErrorBody
// @Failure      409 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req struct {
		Email      string  `json:"email" binding:"required,email"`
		Name       string  `json:"name" binding:"required"`
		Role       string  `json:"role" binding:"required"`
		Password   string  `json:"password" binding:"required,min=6"`
		ImageURL   *string `json:"image_url,omitempty"`
		FounderID  *uint64 `json:"founder_id,omitempty"`
		InvestorID *uint64 `json:"investor_id,omitempty"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.JSON(c, http.StatusBadRequest, gin.H{"code": 2100, "message": "invalid request payload", "errors": err.Error()})
		return
	}

	var count int64
	if err := h.db.Model(&models.User{}).Where("email = ?", req.Email).Count(&count).Error; err != nil {
		h.log.WithError(err).Error("db count email")
		response.JSON(c, http.StatusInternalServerError, gin.H{"code": "internal_error", "message": "failed to process request"})
		return
	}
	if count > 0 {
		response.JSON(c, http.StatusConflict, gin.H{"code": "email_taken", "message": "email already registered"})
		return
	}

	roleIn := strings.ToLower(strings.TrimSpace(req.Role))
	switch roleIn {
	case "investor":
		req.Role = "investor"
	case "founder":
		req.Role = "founder"
	default:
		response.JSON(c, http.StatusBadRequest, gin.H{"code": "invalid_role", "message": "role must be 'investor' or 'founder'"})
		return
	}

	hash, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	u := models.User{
		Email:        req.Email,
		Name:         req.Name,
		Role:         req.Role,
		PasswordHash: string(hash),
		ImageURL:     req.ImageURL,
		FounderID:    req.FounderID,
		InvestorID:   req.InvestorID,
	}
	if err := h.db.Create(&u).Error; err != nil {
		h.log.WithError(err).Error("db create user")
		response.JSON(c, http.StatusInternalServerError, gin.H{"code": "internal_error", "message": "failed to create user"})
		return
	}

	if u.Role == "investor" && u.InvestorID == nil {
		_ = h.alignInvestorSequence()
		inv := models.Investor{Name: u.Name, Email: u.Email}
		if err := h.db.Create(&inv).Error; err != nil {
			h.log.WithError(err).Warn("failed to auto-create investor profile")
		} else if inv.ID != 0 {
			if err := h.db.Model(&u).Update("investor_id", inv.ID).Error; err != nil {
				h.log.WithError(err).Warn("failed to assign investor_id to user")
			} else {
				id := inv.ID
				u.InvestorID = &id
			}
		}
	}

	if h.mailer != nil {
		if token, err := h.createOneTimeToken(c, u.ID, "verify", h.cfg.Auth.EmailVerificationTTL); err != nil {
			h.log.WithError(err).Warn("createOneTimeToken verify failed")
		} else {
			link := fmt.Sprintf("%s/api/%s/auth/verify?token=%s", strings.TrimRight(h.cfg.App.BaseURL, "/"), h.cfg.App.Version, token)
			subject := "Verify your email"
			body := fmt.Sprintf("<p>Welcome %s,</p><p>Please verify your email by clicking the link below:</p><p><a href=\"%s\">Verify Email</a></p>", u.Name, link)
			if err := h.mailer.Send(c.Request.Context(), u.Email, subject, body); err != nil {
				h.log.WithError(err).Warn("mailer.Send verify email failed")
			}
		}
	} else {
		h.log.Warn("mailer is nil; skipping verification email")
	}

	response.JSON(c, http.StatusCreated, gin.H{
		"user":    u,
		"message": "verification email sent; please verify before logging in",
	})
}

// Login godoc
// @Summary      Sign in
// @Description  Verifies credentials, sets HttpOnly cookies, and returns the user profile. No tokens in response.
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param        payload body requests.AuthLoginRequest true "Credentials" Example({"email":"john@doe.tld","password":"secret123"})
// @Success      200 {object} response.AuthLoginResponse
// @Failure      400 {object} response.ErrorBody
// @Failure      401 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.JSON(c, http.StatusBadRequest, gin.H{"code": 2100, "message": "invalid request payload", "errors": err.Error()})
		return
	}

	var u models.User
	if err := h.db.Where("email = ?", req.Email).First(&u).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.JSON(c, http.StatusUnauthorized, gin.H{"code": "invalid_credentials", "message": "invalid credentials"})
			return
		}
		h.log.WithError(err).Error("db first user by email")
		response.JSON(c, http.StatusInternalServerError, gin.H{"code": "internal_error", "message": "failed to process request"})
		return
	}
	if bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(req.Password)) != nil {
		response.JSON(c, http.StatusUnauthorized, gin.H{"code": "invalid_credentials", "message": "invalid credentials"})
		return
	}

	if !u.EmailVerified {
		response.JSON(c, http.StatusForbidden, gin.H{"code": "email_not_verified", "message": "please verify your email before logging in"})
		return
	}
	pair, err := auth.GenerateTokenPair(h.cfg, u.ID, u.Email, u.Role)
	if err != nil {
		h.log.WithError(err).Error("GenerateTokenPair")
		response.JSON(c, http.StatusInternalServerError, gin.H{"code": "internal_error", "message": "failed to issue tokens"})
		return
	}
	h.setAuthCookies(c, pair)
	response.JSON(c, http.StatusOK, gin.H{"user": u})
}

// Refresh godoc
// @Summary      Refresh session
// @Description  Issues new cookies using the refresh token cookie. No body required; no content returned.
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Success      204  "No Content"
// @Failure      400 {object} response.ErrorBody
// @Failure      401 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /auth/refresh [post]
func (h *AuthHandler) Refresh(c *gin.Context) {
	// Strict cookie-based refresh
	refreshToken, err := c.Cookie("refresh_token")
	if err != nil || refreshToken == "" {
		response.JSON(c, http.StatusUnauthorized, gin.H{"code": "invalid_token", "message": "missing refresh token"})
		return
	}

	claims, err := auth.ParseClaims(h.cfg, refreshToken)
	if err != nil || claims.Type != "refresh" {
		response.JSON(c, http.StatusUnauthorized, gin.H{"code": "invalid_token", "message": "invalid refresh token"})
		return
	}

	var u models.User
	if err := h.db.First(&u, claims.UserID).Error; err != nil {
		response.JSON(c, http.StatusUnauthorized, gin.H{"code": "invalid_token", "message": "user no longer exists"})
		return
	}

	if !u.EmailVerified {
		response.JSON(c, http.StatusUnauthorized, gin.H{"code": "email_not_verified", "message": "email not verified"})
		return
	}

	pair, err := auth.GenerateTokenPair(h.cfg, u.ID, u.Email, u.Role)
	if err != nil {
		h.log.WithError(err).Error("GenerateTokenPair")
		response.JSON(c, http.StatusInternalServerError, gin.H{"code": "internal_error", "message": "failed to issue tokens"})
		return
	}
	h.setAuthCookies(c, pair)
	c.Status(http.StatusNoContent)
}

// VerifyEmail godoc
// @Summary      Verify email
// @Description  Verifies the user's email using a one-time token.
// @Tags         Auth
// @Produce      json
// @Param        token query string false "Verification token"
// @Param        payload body requests.AuthVerifyRequest false "Token in body" Example({"token":"<token>"})
// @Success      200 {object} response.MessageResponse
// @Failure      400 {object} response.ErrorBody
// @Failure      401 {object} response.ErrorBody
// @Failure      404 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /auth/verify [get]
// @Router       /auth/verify [post]
func (h *AuthHandler) VerifyEmail(c *gin.Context) {
	type reqBody struct {
		Token string `json:"token"`
	}
	token := c.Query("token")
	if token == "" {
		var rb reqBody
		_ = c.ShouldBindJSON(&rb)
		token = rb.Token
	}
	if token == "" {
		response.JSON(c, http.StatusBadRequest, gin.H{"code": 2100, "message": "missing token"})
		return
	}
	userID, err := h.consumeOneTimeToken(c, token, "verify")
	if err != nil {
		response.JSON(c, http.StatusUnauthorized, gin.H{"code": "invalid_token", "message": err.Error()})
		return
	}
	var u models.User
	if err := h.db.First(&u, userID).Error; err != nil {
		response.JSON(c, http.StatusNotFound, gin.H{"code": "user_not_found", "message": "user not found"})
		return
	}
	if u.EmailVerified {
		response.JSON(c, http.StatusOK, gin.H{"message": "email already verified"})
		return
	}
	if err := h.db.Model(&u).Update("email_verified", true).Error; err != nil {
		h.log.WithError(err).Error("db update email_verified")
		response.JSON(c, http.StatusInternalServerError, gin.H{"code": "internal_error", "message": "failed to verify email"})
		return
	}
	response.JSON(c, http.StatusOK, gin.H{"message": "email verified"})
}

// ForgotPassword godoc
// @Summary      Forgot password
// @Description  Sends a password reset email (if the user exists).
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param        payload body requests.AuthForgotPasswordRequest true "Email" Example({"email":"john@doe.tld"})
// @Success      200 {object} response.MessageResponse
// @Failure      400 {object} response.ErrorBody
// @Router       /auth/forgot-password [post]
func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required,email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.JSON(c, http.StatusBadRequest, gin.H{"code": 2100, "message": "invalid request payload", "errors": err.Error()})
		return
	}

	var u models.User
	if err := h.db.Where("email = ?", req.Email).First(&u).Error; err != nil {
		response.JSON(c, http.StatusOK, gin.H{"message": "if the email exists, a reset link was sent"})
		return
	}
	if h.mailer == nil {
		h.log.Warn("mailer is nil; cannot send reset email")
		response.JSON(c, http.StatusOK, gin.H{"message": "if the email exists, a reset link was sent"})
		return
	}
	token, err := h.createOneTimeToken(c, u.ID, "reset", h.cfg.Auth.PasswordResetTTL)
	if err != nil {
		h.log.WithError(err).Warn("createOneTimeToken reset failed")
		response.JSON(c, http.StatusOK, gin.H{"message": "if the email exists, a reset link was sent"})
		return
	}
	link := fmt.Sprintf("%s/reset-password?token=%s", strings.TrimRight(h.cfg.App.BaseURL, "/"), token)
	subject := "Reset your password"
	body := fmt.Sprintf("<p>Hello %s,</p><p>You requested a password reset. Click the link below to set a new password (valid for %d minutes):</p><p><a href=\"%s\">Reset Password</a></p>", u.Name, int(h.cfg.Auth.PasswordResetTTL.Minutes()), link)
	if err := h.mailer.Send(c.Request.Context(), u.Email, subject, body); err != nil {
		h.log.WithError(err).Warn("mailer.Send reset email failed")
	}
	response.JSON(c, http.StatusOK, gin.H{"message": "if the email exists, a reset link was sent"})
}

// ResetPassword godoc
// @Summary      Reset password
// @Description  Updates the password using a valid reset token.
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param        payload body requests.AuthResetPasswordRequest true "New password" Example({"token":"<token>","new_password":"secret123"})
// @Success      200 {object} response.MessageResponse
// @Failure      400 {object} response.ErrorBody
// @Failure      401 {object} response.ErrorBody
// @Failure      404 {object} response.ErrorBody
// @Failure      500 {object} response.ErrorBody
// @Router       /auth/reset-password [post]
func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var req struct {
		Token       string `json:"token" binding:"required"`
		NewPassword string `json:"new_password" binding:"required,min=6"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.JSON(c, http.StatusBadRequest, gin.H{"code": 2100, "message": "invalid request payload", "errors": err.Error()})
		return
	}
	userID, err := h.consumeOneTimeToken(c, req.Token, "reset")
	if err != nil {
		response.JSON(c, http.StatusUnauthorized, gin.H{"code": "invalid_token", "message": err.Error()})
		return
	}
	var u models.User
	if err := h.db.First(&u, userID).Error; err != nil {
		response.JSON(c, http.StatusNotFound, gin.H{"code": "user_not_found", "message": "user not found"})
		return
	}
	hash, _ := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err := h.db.Model(&u).Updates(map[string]interface{}{
		"password_hash": string(hash),
	}).Error; err != nil {
		h.log.WithError(err).Error("db update password_hash")
		response.JSON(c, http.StatusInternalServerError, gin.H{"code": "internal_error", "message": "failed to reset password"})
		return
	}
	response.JSON(c, http.StatusOK, gin.H{"message": "password updated"})
}

// Logout clears auth cookies
// @Summary      Logout
// @Description  Clears auth cookies.
// @Tags         Auth
// @Success      204 "No Content"
// @Router       /auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	h.clearAuthCookies(c)
	c.Status(http.StatusNoContent)
}

// alignInvestorSequence bumps investors.id sequence above both existing investors.id
// and any users.investor_id references, to ensure new investors get a fresh ID
func (h *AuthHandler) alignInvestorSequence() error {
	sql := `SELECT setval(
        pg_get_serial_sequence('investors','id'),
        COALESCE(GREATEST(
            (SELECT MAX(id) FROM investors),
            (SELECT MAX(investor_id) FROM users)
        ), 0) + 1,
        false
    )`
	if err := h.db.Exec(sql).Error; err != nil {
		h.log.WithError(err).Warn("alignInvestorSequence failed")
		return err
	}
	return nil
}

// createOneTimeToken creates and stores a one-time token (verify/reset) and returns the plain token string
func (h *AuthHandler) createOneTimeToken(c *gin.Context, userID uint64, tokenType string, ttl time.Duration) (string, error) {
	if tokenType != "verify" && tokenType != "reset" {
		return "", fmt.Errorf("invalid token type")
	}

	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		return "", fmt.Errorf("rand.Read: %w", err)
	}

	secret := hex.EncodeToString(buf)
	sum := sha256.Sum256([]byte(secret))
	hashHex := hex.EncodeToString(sum[:])
	expiresAt := time.Now().Add(ttl)
	at := models.AuthToken{
		UserID:    userID,
		TokenHash: hashHex,
		TokenType: tokenType,
		ExpiresAt: expiresAt,
	}

	if err := h.db.WithContext(c.Request.Context()).Create(&at).Error; err != nil {
		return "", fmt.Errorf("db create auth_token: %w", err)
	}
	return secret, nil
}

// consumeOneTimeToken validates and deletes a token. Returns the associated userID
func (h *AuthHandler) consumeOneTimeToken(c *gin.Context, secret string, tokenType string) (uint64, error) {
	if secret == "" {
		return 0, fmt.Errorf("missing token")
	}
	if tokenType != "verify" && tokenType != "reset" {
		return 0, fmt.Errorf("invalid token type")
	}

	sum := sha256.Sum256([]byte(secret))
	hashHex := hex.EncodeToString(sum[:])
	var at models.AuthToken
	now := time.Now()

	tx := h.db.WithContext(c.Request.Context()).
		Where("token_hash = ? AND token_type = ? AND expires_at > ?", hashHex, tokenType, now).
		First(&at)
	if tx.Error != nil {
		if errors.Is(tx.Error, gorm.ErrRecordNotFound) {
			return 0, fmt.Errorf("invalid or expired token")
		}
		return 0, fmt.Errorf("db find token: %w", tx.Error)
	}

	if err := h.db.WithContext(c.Request.Context()).Delete(&at).Error; err != nil {
		h.log.WithError(err).Warn("failed to delete consumed token")
	}
	return at.UserID, nil
}

// setAuthCookies sets access and refresh tokens as HttpOnly cookies
func (h *AuthHandler) setAuthCookies(c *gin.Context, pair *auth.TokenPair) {
	// Determine cookie attributes based on environment
	env := strings.ToLower(strings.TrimSpace(h.cfg.App.Env))
	// In production-like envs, require Secure and SameSite=None for cross-site usage
	secure := env == "staging" || env == "production" || env == "prod"
	sameSite := http.SameSiteLaxMode
	if secure {
		sameSite = http.SameSiteNoneMode
	}

	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "access_token",
		Value:    pair.AccessToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   secure,
		SameSite: sameSite,
		Expires:  time.Now().Add(h.cfg.Auth.JWT.AccessTokenTTL),
		MaxAge:   int(h.cfg.Auth.JWT.AccessTokenTTL.Seconds()),
	})
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "refresh_token",
		Value:    pair.RefreshToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   secure,
		SameSite: sameSite,
		Expires:  time.Now().Add(h.cfg.Auth.JWT.RefreshTokenTTL),
		MaxAge:   int(h.cfg.Auth.JWT.RefreshTokenTTL.Seconds()),
	})
}

// clearAuthCookies deletes auth cookies
func (h *AuthHandler) clearAuthCookies(c *gin.Context) {
	env := strings.ToLower(strings.TrimSpace(h.cfg.App.Env))
	secure := env == "staging" || env == "production" || env == "prod"
	sameSite := http.SameSiteLaxMode
	if secure {
		sameSite = http.SameSiteNoneMode
	}
	expired := time.Now().Add(-time.Hour)
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "access_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   secure,
		SameSite: sameSite,
		Expires:  expired,
		MaxAge:   -1,
	})
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   secure,
		SameSite: sameSite,
		Expires:  expired,
		MaxAge:   -1,
	})
}
