package config

import (
	"fmt"
	"github.com/go-viper/mapstructure/v2"
	"github.com/spf13/viper"
	"time"
)

type Config struct {
	App           AppConfig           `yaml:"app"`
	Database      DatabaseConfig      `yaml:"database"`
	Auth          AuthConfig          `yaml:"auth"`
	API           APIConfig           `yaml:"api"`
	Sync          SyncConfig          `yaml:"sync"`
	Logging       LoggingConfig       `yaml:"logging"`
	Metrics       MetricsConfig       `yaml:"metrics"`
	Health        HealthConfig        `yaml:"health"`
	Security      SecurityConfig      `yaml:"security"`
	Storage       StorageConfig       `yaml:"storage"`
	Notifications NotificationsConfig `yaml:"notifications"`
	Jobs          JobsConfig          `yaml:"jobs"`
	Features      FeaturesConfig      `yaml:"features"`
}

type AppConfig struct {
	Name    string `yaml:"name"`
	Env     string `yaml:"env"`
	Port    int    `yaml:"port"`
	BaseURL string `yaml:"base_url"`
	Version string `yaml:"version"`
}

type DatabaseConfig struct {
	URL      string `yaml:"url"`
	PoolSize int    `yaml:"pool_size"`
	SSL      bool   `yaml:"ssl"`
}

type AuthConfig struct {
	JWT                  JWTConfig     `yaml:"jwt"`
	PasswordResetTTL     time.Duration `yaml:"password_reset_ttl"`
	EmailVerificationTTL time.Duration `yaml:"email_verification_ttl"`
}

type JWTConfig struct {
	Secret          string        `yaml:"secret"`
	AccessTokenTTL  time.Duration `yaml:"access_token_ttl"`
	RefreshTokenTTL time.Duration `yaml:"refresh_token_ttl"`
}

type APIConfig struct {
	JEB JEBAPIConfig `yaml:"jeb"`
}

type JEBAPIConfig struct {
	BaseURL    string        `yaml:"base_url"`
	GroupToken string        `yaml:"group_token"`
	Timeout    time.Duration `yaml:"timeout"`
	Retry      RetryConfig   `yaml:"retry"`
}

type RetryConfig struct {
	MaxAttempts int           `yaml:"max_attempts"`
	Backoff     time.Duration `yaml:"backoff"`
}

type SyncConfig struct {
	FullImport      string `yaml:"full_import"`
	IncrementalCron string `yaml:"incremental_cron"`
}

type LoggingConfig struct {
	Level     string `yaml:"level"`
	Format    string `yaml:"format"`
	RequestID bool   `yaml:"request_id"`
}

type MetricsConfig struct {
	Enabled bool   `yaml:"enabled"`
	Path    string `yaml:"path"`
}

type HealthConfig struct {
	Enabled bool   `yaml:"enabled"`
	Path    string `yaml:"path"`
}

type SecurityConfig struct {
	CORS      CORSConfig      `yaml:"cors"`
	RateLimit RateLimitConfig `yaml:"rate_limit"`
	AuditLog  bool            `yaml:"audit_log"`
}

type CORSConfig struct {
	AllowedOrigins []string `yaml:"allowed_origins"`
	AllowedMethods []string `yaml:"allowed_methods"`
}

type RateLimitConfig struct {
	Window      time.Duration `yaml:"window"`
	MaxRequests int           `yaml:"max_requests"`
}

type StorageConfig struct {
	Media MediaConfig `yaml:"media"`
}

type MediaConfig struct {
	Provider      string    `yaml:"provider"`
	LocalPath     string    `yaml:"local_path"`
	S3            *S3Config `yaml:"s3"`
	PublicBaseURL string    `yaml:"public_base_url"`
}

type S3Config struct {
	Bucket         string `yaml:"bucket"`
	Region         string `yaml:"region"`
	Endpoint       string `yaml:"endpoint"`
	ForcePathStyle bool   `yaml:"force_path_style"`
}

type NotificationsConfig struct {
	Email EmailConfig `yaml:"email"`
	InApp bool        `yaml:"in_app"`
}

type EmailConfig struct {
	Provider string `yaml:"provider"`
	SMTPURL  string `yaml:"smtp_url"`
	From     string `yaml:"from"`
}

type JobsConfig struct {
	RetryBackoff time.Duration `yaml:"retry_backoff"`
	MaxRetries   int           `yaml:"max_retries"`
}

type FeaturesConfig struct {
	EnableMessaging     bool `yaml:"enable_messaging"`
	EnableOpportunities bool `yaml:"enable_opportunities"`
	EnableFavorites     bool `yaml:"enable_favorites"`
}

func NewConfig() (*Config, error) {
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./configs")
	viper.SetConfigName("config")

	if err := viper.ReadInConfig(); err != nil {
		viper.SetConfigName("config.example")
		if err2 := viper.ReadInConfig(); err2 != nil {
			return nil, fmt.Errorf("viper.ReadInConfig(): %w", err)
		}
	}

	var config *Config
	if err := viper.Unmarshal(&config, func(config *mapstructure.DecoderConfig) {
		config.TagName = "yaml"
	}); err != nil {
		return nil, fmt.Errorf("viper.Unmarshal(&config): %w", err)
	}

	return config, nil
}
