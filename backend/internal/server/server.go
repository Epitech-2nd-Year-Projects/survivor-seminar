package server

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/config"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/database"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/handlers"
	opportunities2 "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/http/opportunities"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/middleware"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type HTTPServer struct {
	Engine *gin.Engine
	cfg    *config.Config
	log    *logrus.Logger
	http   *http.Server
	db     *gorm.DB
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
	h.registerRoutes()

	return h
}

func (s *HTTPServer) registerRoutes() {
	root := handlers.NewRootHandler(s.cfg)
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

	health := handlers.NewHealthHandler(s.cfg, s.db)
	if s.cfg.Health.Enabled {
		v1.GET(s.cfg.Health.Path, health.Health)
	}

	if s.cfg.Metrics.Enabled {
		v1.GET(s.cfg.Metrics.Path, func(c *gin.Context) {
			c.Header("Content-Type", "text/plain; version=0.0.4")
			c.String(http.StatusOK, "# metrics exposed here in future\n")
		})
	}

	v1.Group("/startups")
	v1.Group("/news")
	v1.Group("/events")
	v1.Group("/sectors")
	v1.Group("/locations")
	v1.Group("/tags")
	v1.Group("/track")
	v1.Group("/startup")
	v1.Group("/conversations")

	opportunityHandler := opportunities2.NewOpportunityHandler(s.log, s.db)
	opportunities := v1.Group("/opportunities")
	opportunities.GET("", opportunityHandler.GetOpportunities)
	opportunities.GET("/:id", opportunityHandler.GetOpportunity)

	v1.Group("/favorites")
	v1.Group("/admin")

	admin := v1.Group("/admin")
	{
		adminOpportunities := admin.Group("/opportunities")
		adminOpportunities.POST("", opportunityHandler.CreateOpportunity)
		adminOpportunities.PATCH("/:id", opportunityHandler.UpdateOpportunity)
		adminOpportunities.GET("", opportunityHandler.GetOpportunities)
		adminOpportunities.GET("/:id", opportunityHandler.GetOpportunity)
		adminOpportunities.DELETE("/:id", opportunityHandler.DeleteOpportunity)
	}

}

func (s *HTTPServer) Start() error {
	addr := fmt.Sprintf(":%d", s.cfg.App.Port)
	s.http = &http.Server{
		Addr:    addr,
		Handler: s.Engine,
	}

	s.log.WithField("addr", addr).Info("HTTP server starting")

	return s.http.ListenAndServe()
}

func (s *HTTPServer) Shutdown(ctx context.Context) error {
	if s.http == nil {
		return nil
	}
	s.log.Info("HTTP server shutting down")

	shutdownCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	return s.http.Shutdown(shutdownCtx)
}
