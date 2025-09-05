package docs

// Centralized OpenAPI metadata for the API.
//
// @title          Survivor Seminar API
// @version        1.0
// @description    API for managing startups, investors, events, news, opportunities, partners, users and synchronization.
// @BasePath       /api/v1
// @schemes        http https
// @accept         json
// @produce        json
//
// @contact.name   Team JEB
// @contact.url    https://example.com
// @contact.email  team@example.com
//
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Enter "Bearer {token}". Admin routes require the admin role.
//
// @tag.name       Health
// @tag.description API supervision (uptime, dependencies)
//
// @tag.name       Auth
// @tag.description Authentication, tokens and security
//
// @tag.name       Users
// @tag.description User management (profile, admin)
//
// @tag.name       Startups
// @tag.description Startups catalog
//
// @tag.name       Investors
// @tag.description Investors directory
//
// @tag.name       News
// @tag.description News about startups and the ecosystem
//
// @tag.name       Events
// @tag.description Events (conferences, meetups, etc.)
//
// @tag.name       Opportunities
// @tag.description Opportunities (calls for projects, grants, contests)
//
// @tag.name       Partners
// @tag.description Partners (companies, institutions)
//
// @tag.name       Admin/Sync
// @tag.description Administration and data synchronization
