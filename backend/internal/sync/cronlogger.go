package sync

import (
	"github.com/robfig/cron/v3"
	"github.com/sirupsen/logrus"
)

var _ cron.Logger = (*cronLogger)(nil)

type cronLogger struct {
	log *logrus.Logger
}

// Info logs a message at the Info log level with optional key-value pairs for structured logging
func (l cronLogger) Info(msg string, keysAndValues ...interface{}) {
	l.log.WithFields(kvToFields(keysAndValues...)).Info(msg)
}

// Error logs an error message with an associated error, message, and optional key-value pairs for structured logging
func (l cronLogger) Error(err error, msg string, keysAndValues ...interface{}) {
	l.log.WithError(err).WithFields(kvToFields(keysAndValues...)).Error(msg)
}

func kvToFields(kv ...interface{}) logrus.Fields {
	fields := logrus.Fields{}
	for i := 0; i+1 < len(kv); i += 2 {
		k, ok := kv[i].(string)
		if !ok {
			k = "arg"
		}
		fields[k] = kv[i+1]
	}
	return fields
}
