package v1

import "strings"

func extFromContentType(ct string) string {
	ct = strings.ToLower(strings.TrimSpace(ct))
	switch ct {
	case "image/jpeg", "image/jpg":
		return ".jpg"
	case "image/png":
		return ".png"
	case "image/webp":
		return ".webp"
	case "image/gif":
		return ".gif"
	default:
		return ".jpg"
	}
}
