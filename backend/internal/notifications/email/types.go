package email

import "context"

type Mailer interface {
	Send(ctx context.Context, to string, subject string, htmlBody string) error
}
