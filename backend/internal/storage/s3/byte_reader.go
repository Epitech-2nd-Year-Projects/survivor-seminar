package s3

import (
	"fmt"
	"io"
)

func bytesReader(b []byte) *byteReader { return &byteReader{b: b} }

type byteReader struct {
	b []byte
	i int64
}

func (r *byteReader) Read(p []byte) (int, error) {
	if r.i >= int64(len(r.b)) {
		return 0, io.EOF
	}
	n := copy(p, r.b[r.i:])
	r.i += int64(n)
	return n, nil
}

func (r *byteReader) Seek(offset int64, whence int) (int64, error) {
	var n int64
	switch whence {
	case 0:
		n = offset
	case 1:
		n = r.i + offset
	case 2:
		n = int64(len(r.b)) + offset
	}
	if n < 0 {
		return 0, fmt.Errorf("invalid seek")
	}
	r.i = n
	return n, nil
}
