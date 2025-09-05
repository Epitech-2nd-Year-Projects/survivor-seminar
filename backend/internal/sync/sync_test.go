package sync

import (
	"bytes"
	"context"
	"errors"
	"testing"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
)

func TestExtFromContentType(t *testing.T) {
	assert.Equal(t, ".jpg", extFromContentType("image/jpeg"))
	assert.Equal(t, ".jpg", extFromContentType("image/jpg"))
	assert.Equal(t, ".png", extFromContentType("image/png"))
	assert.Equal(t, ".webp", extFromContentType("image/webp"))
	assert.Equal(t, ".gif", extFromContentType("image/gif"))
	assert.Equal(t, ".jpg", extFromContentType("unknown/type"))
}

func TestStatusStore(t *testing.T) {
	s := newStatusStore()
	s.setRunning(true)
	assert.True(t, s.snapshot().Running)

	run := RunInfo{Type: "full", StartedAt: time.Now()}
	s.setLast(run)
	ss := s.snapshot()
	assert.NotNil(t, ss.LastFull)

	run2 := RunInfo{Type: "incremental", StartedAt: time.Now()}
	s.setLast(run2)
	ss = s.snapshot()
	assert.NotNil(t, ss.LastIncremental)
}

func TestCronLogger(t *testing.T) {
	var buf bytes.Buffer
	log := logrus.New()
	log.SetOutput(&buf)

	cl := cronLogger{log: log}
	cl.Info("info msg", "key", "val")
	cl.Error(errors.New("err"), "error msg", "key", "val")

	out := buf.String()
	assert.Contains(t, out, "info msg")
	assert.Contains(t, out, "error msg")
}

type fakeSyncer struct {
	fullN int
	incN  int
	err   error
}

func (f *fakeSyncer) FullSync(context.Context) (int, error) {
	return f.fullN, f.err
}
func (f *fakeSyncer) IncrementalSync(context.Context) (int, error) {
	return f.incN, f.err
}

func TestMultiService(t *testing.T) {
	log := logrus.New()
	s1 := &fakeSyncer{fullN: 2, incN: 1, err: nil}
	s2 := &fakeSyncer{fullN: 3, incN: 2, err: errors.New("fail")}
	m := NewMultiService([]Syncer{s1, s2}, log)

	n, err := m.FullSync(context.Background())
	assert.Equal(t, 5, n)
	assert.Error(t, err)

	n, err = m.IncrementalSync(context.Background())
	assert.Equal(t, 3, n)
	assert.Error(t, err)
}

type fakeAPI struct {
	full []UpstreamItem
	inc  []UpstreamItem
	err  error
}

func (f *fakeAPI) FetchFull(context.Context) ([]UpstreamItem, error) {
	return f.full, f.err
}
func (f *fakeAPI) FetchIncremental(context.Context, time.Time) ([]UpstreamItem, error) {
	return f.inc, f.err
}

type fakeRepo struct {
	upsertErr error
	lastErr   error
	updateErr error
}

func (f *fakeRepo) UpsertBatch(context.Context, []UpstreamItem) error {
	return f.upsertErr
}
func (f *fakeRepo) LastIncrementalWatermark(context.Context) (time.Time, error) {
	if f.lastErr != nil {
		return time.Time{}, f.lastErr
	}
	return time.Now().Add(-time.Hour), nil
}
func (f *fakeRepo) UpdateIncrementalWatermark(context.Context, time.Time) error {
	return f.updateErr
}

func TestService_FullSync(t *testing.T) {
	api := &fakeAPI{full: []UpstreamItem{{ExternalID: "1"}}, err: nil}
	repo := &fakeRepo{}
	s := NewService(api, repo, logrus.New())

	n, err := s.FullSync(context.Background())
	assert.Equal(t, 1, n)
	assert.NoError(t, err)

	api.err = errors.New("api fail")
	n, err = s.FullSync(context.Background())
	assert.Equal(t, 0, n)
	assert.Error(t, err)

	api.err = nil
	repo.upsertErr = errors.New("db fail")
	n, err = s.FullSync(context.Background())
	assert.Equal(t, 0, n)
	assert.Error(t, err)
}

func TestService_IncrementalSync(t *testing.T) {
	api := &fakeAPI{inc: []UpstreamItem{{ExternalID: "1"}}, err: nil}
	repo := &fakeRepo{}
	s := NewService(api, repo, logrus.New())

	n, err := s.IncrementalSync(context.Background())
	assert.Equal(t, 1, n)
	assert.NoError(t, err)

	api.err = errors.New("api fail")
	n, err = s.IncrementalSync(context.Background())
	assert.Equal(t, 0, n)
	assert.Error(t, err)

	api.err = nil
	repo.upsertErr = errors.New("db fail")
	n, err = s.IncrementalSync(context.Background())
	assert.Equal(t, 0, n)
	assert.Error(t, err)

	repo.upsertErr = nil
	repo.updateErr = errors.New("update fail")
	n, err = s.IncrementalSync(context.Background())
	assert.Equal(t, 1, n)
	assert.Error(t, err)
}

type fakeSvc struct{}

func (f *fakeSvc) FullSync(context.Context) (int, error)        { return 1, nil }
func (f *fakeSvc) IncrementalSync(context.Context) (int, error) { return 2, nil }

func TestScheduler(t *testing.T) {
	log := logrus.New()
	s := NewScheduler(&fakeSvc{}, log)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	err := s.Start(ctx)
	assert.NoError(t, err)

	assert.NoError(t, s.TriggerFullSync(ctx))
	assert.NoError(t, s.TriggerIncrementalSync(ctx))

	_, err = s.Schedule("@every 1s", func(ctx context.Context) {}, "test")
	assert.NoError(t, err)

	ss := s.Status()
	assert.NotNil(t, ss)

	assert.NoError(t, s.Stop(ctx))
}
