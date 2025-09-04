package s3

import (
	"context"
	"fmt"
	"path"
	"strings"

	cfgpkg "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/config"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	awsS3 "github.com/aws/aws-sdk-go-v2/service/s3"
)

type Uploader interface {
	Upload(ctx context.Context, key string, contentType string, data []byte) (string, error)
}

type S3Uploader struct {
	client     *awsS3.Client
	bucket     string
	publicBase string
}

func NewUploader(ctx context.Context, mc cfgpkg.MediaConfig) (*S3Uploader, error) {
	if mc.S3 == nil {
		return nil, fmt.Errorf("missing S3 config")
	}

	var loadOpts []func(*config.LoadOptions) error
	if mc.S3.Region != "" {
		loadOpts = append(loadOpts, config.WithRegion(mc.S3.Region))
	}

	if mc.S3.Endpoint != "" {
		loadOpts = append(loadOpts, config.WithEndpointResolverWithOptions(aws.EndpointResolverWithOptionsFunc(
			func(service, region string, options ...interface{}) (aws.Endpoint, error) {
				return aws.Endpoint{URL: mc.S3.Endpoint, HostnameImmutable: true}, nil
			},
		)))
	}

	cfg, err := config.LoadDefaultConfig(ctx, loadOpts...)
	if err != nil {
		return nil, fmt.Errorf("aws config: %w", err)
	}

	client := awsS3.NewFromConfig(cfg, func(o *awsS3.Options) {
		if mc.S3.Endpoint != "" {
			o.UsePathStyle = mc.S3.ForcePathStyle
		}
	})
	return &S3Uploader{client: client, bucket: mc.S3.Bucket, publicBase: strings.TrimRight(mc.PublicBaseURL, "/")}, nil
}

func (u *S3Uploader) Upload(ctx context.Context, key string, contentType string, data []byte) (string, error) {
	if _, err := u.client.PutObject(ctx, &awsS3.PutObjectInput{
		Bucket:      aws.String(u.bucket),
		Key:         aws.String(key),
		Body:        bytesReader(data),
		ContentType: aws.String(contentType),
	}); err != nil {
		return "", fmt.Errorf("s3 put: %w", err)
	}
	return u.publicBase + "/" + path.Clean(key), nil
}
