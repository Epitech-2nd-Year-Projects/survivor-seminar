package server

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/config"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/database"
	_ "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/docs"
	v1handlers "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/handlers/v1"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/middleware"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/notifications/email"
	v1routes "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/server/routes/v1"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/storage/s3"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/sync"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"gorm.io/gorm"
)

type HTTPServer struct {
	Engine *gin.Engine
	cfg    *config.Config
	log    *logrus.Logger
	http   *http.Server
	db     *gorm.DB
	sched  sync.Scheduler
	mailer email.Mailer
}

func NewHTTPServer(cfg *config.Config) *HTTPServer {
	g := gin.New()

	logger := logrus.New()
	switch cfg.Logging.Level {
	case "debug":
		logger.SetLevel(logrus.DebugLevel)
	case "warn":
		logger.SetLevel(logrus.WarnLevel)
	case "error":
		logger.SetLevel(logrus.ErrorLevel)
	default:
		logger.SetLevel(logrus.InfoLevel)
	}
	if cfg.Logging.Format == "json" {
		logger.SetFormatter(&logrus.JSONFormatter{})
	}

	g.Use(middleware.RequestID())
	g.Use(middleware.Recovery(logger))
	g.Use(middleware.Logger(logger))
	g.Use(middleware.CORS(cfg))

	var gormDB *gorm.DB
	if db, err := database.Open(cfg, logger); err != nil {
		logger.WithError(err).Warn("failed to connect database")
	} else {
		gormDB = db
		logger.Info("database connection established")
	}

	h := &HTTPServer{
		Engine: g,
		cfg:    cfg,
		log:    logger,
		db:     gormDB,
	}
	h.initMailer()
	h.registerRoutes()
	h.initSync()

	return h
}

func (s *HTTPServer) registerRoutes() {
	root := v1handlers.NewRootHandler(s.cfg)
	g := s.Engine
	g.GET("/", root.Info)

	g.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{"code": "not_found", "message": "route not found"})
	})
	g.NoMethod(func(c *gin.Context) {
		c.JSON(http.StatusMethodNotAllowed, gin.H{"code": "method_not_allowed", "message": "method not allowed"})
	})

	api := g.Group("/api")
	v1 := api.Group("/" + s.cfg.App.Version)

	v1.Group("/admin")

	health := v1handlers.NewHealthHandler(s.cfg, s.db)
	if s.cfg.Health.Enabled {
		v1.GET(s.cfg.Health.Path, health.Health)
	}

	if s.cfg.Metrics.Enabled {
		v1.GET(s.cfg.Metrics.Path, func(c *gin.Context) {
			c.Header("Content-Type", "text/plain; version=0.0.4")
			c.String(http.StatusOK, "# metrics exposed here in future\n")
		})
	}

	uploader, err := s3.NewUploader(context.Background(), s.cfg.Storage.Media)
	if err != nil {
		s.log.WithError(err).Warn("failed to init S3 uploader")
	}

	g.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	v1routes.RegisterStartups(v1, s.cfg, s.db, s.log)
	v1routes.RegisterInvestors(v1, s.cfg, s.db, s.log)
	v1routes.RegisterUsers(v1, s.cfg, s.db, s.log, uploader)
	v1routes.RegisterNews(v1, s.cfg, s.db, s.log, uploader)
	v1routes.RegisterEvents(v1, s.cfg, s.db, s.log, uploader)
	v1routes.RegisterOpportunities(v1, s.cfg, s.db, s.log)
	v1routes.RegisterPartners(v1, s.cfg, s.db, s.log)
	v1routes.RegisterStatistics(v1, s.cfg, s.db, s.log)
	v1routes.RegisterAuth(v1, s.cfg, s.db, s.log, s.mailer)
	v1routes.RegisterConversations(v1, s.cfg, s.db, s.log)
	v1.Group("/sectors")
	v1.Group("/locations")
	v1.Group("/tags")
	v1.Group("/track")
	v1.Group("/conversations")
}

func (s *HTTPServer) initMailer() {
	if s.cfg.Notifications.Email.Provider == "smtp" {
		ctx := context.Background()
		m, err := email.NewSMTPMailer(ctx, s.cfg)
		if err != nil {
			s.log.WithError(err).Warn("failed to initialize SMTP mailer")
			return
		}
		s.mailer = m
		s.log.Info("email mailer initialized (smtp)")
	} else if s.cfg.Notifications.Email.Provider == "" {
		s.log.Info("email provider not set; mailer disabled")
	} else {
		s.log.WithField("provider", s.cfg.Notifications.Email.Provider).Warn("unsupported email provider; mailer disabled")
	}
}

func (s *HTTPServer) Start() error {
	addr := fmt.Sprintf(":%d", s.cfg.App.Port)
	s.http = &http.Server{
		Addr:    addr,
		Handler: s.Engine,
	}

	s.log.WithField("addr", addr).Info("HTTP server starting")

	if s.sched != nil {
		_ = s.sched.Start(context.Background())
		if s.cfg.Sync.FullImport == "on_startup" {
			_ = s.sched.TriggerFullSync(context.Background())
		}
	}

	return s.http.ListenAndServe()
}

func (s *HTTPServer) Shutdown(ctx context.Context) error {
	if s.http == nil {
		return nil
	}
	s.log.Info("HTTP server shutting down")

	shutdownCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	if s.sched != nil {
		_ = s.sched.Stop(shutdownCtx)
	}

	return s.http.Shutdown(shutdownCtx)
}
