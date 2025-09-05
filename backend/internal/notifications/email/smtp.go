package email

import (
	"context"
	"encoding/base64"
	"fmt"
	"net/mail"
	"net/smtp"
	"net/url"
	"strings"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/config"
)

type SMTPMailer struct {
	from   string
	addr   string
	auth   smtp.Auth
	sender string
}

// NewSMTPMailer constructs a Mailer using a simple SMTP URL and From address
func NewSMTPMailer(_ context.Context, cfg *config.Config) (*SMTPMailer, error) {
	if cfg.Notifications.Email.Provider != "smtp" {
		return nil, fmt.Errorf("email provider not smtp")
	}

	from := cfg.Notifications.Email.From
	if _, err := mail.ParseAddress(from); err != nil {
		return nil, fmt.Errorf("invalid from address: %w", err)
	}

	raw := cfg.Notifications.Email.SMTPURL
	if raw == "" {
		return nil, fmt.Errorf("missing smtp_url config")
	}

	u, err := url.Parse(raw)
	if err != nil {
		return nil, fmt.Errorf("invalid smtp_url: %w", err)
	}

	if u.Scheme != "smtp" {
		return nil, fmt.Errorf("unsupported smtp_url scheme: %s", u.Scheme)
	}
	username := ""
	password := ""
	if u.User != nil {
		username = u.User.Username()
		pw, _ := u.User.Password()
		password = pw
	}

	host := u.Host
	if !strings.Contains(host, ":") {
		host = host + ":587"
	}

	hostOnly := host
	if h, _, err := netSplitHostPort(host); err == nil {
		hostOnly = h
	}

	var auth smtp.Auth
	if username != "" {
		auth = smtp.PlainAuth("", username, password, hostOnly)
	}
	return &SMTPMailer{from: from, addr: host, auth: auth, sender: from}, nil
}

// Send composes a basic HTML email and sends it via smtp.SendMail
func (m *SMTPMailer) Send(_ context.Context, to string, subject string, htmlBody string) error {
	b := strings.Builder{}
	b.WriteString("From: ")
	b.WriteString(m.from)
	b.WriteString("\r\nTo: ")
	b.WriteString(to)
	b.WriteString("\r\nSubject: ")
	b.WriteString(subject)
	b.WriteString("\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n")
	b.WriteString(htmlBody)

	msg := []byte(b.String())
	_ = base64.StdEncoding

	return smtp.SendMail(m.addr, m.auth, m.sender, []string{to}, msg)
}

// netSplitHostPort splits an address string into host and port components, returning an error if the port is missing (so we dont need to import net just for one function)
func netSplitHostPort(hostport string) (host, port string, err error) {
	i := strings.LastIndex(hostport, ":")
	if i < 0 {
		return hostport, "", fmt.Errorf("missing port")
	}

	return hostport[:i], hostport[i+1:], nil
}
