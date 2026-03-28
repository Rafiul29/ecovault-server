# EcoVault Idea API - Postman Collection

## Setup Instructions

1. **Import the Collection**: Import `EcoVault_Idea_API.postman_collection.json` into Postman

2. **Set Environment Variables**:
   - `base_url`: Your API base URL (default: `http://localhost:5000`)
   - `access_token`: Your authentication token (obtained from login)
   - `idea_id`: ID of the idea for testing (obtained from create/get operations)

## API Endpoints

### Public Endpoints (No Authentication Required)

- **GET /ideas** - Get all ideas
- **GET /ideas/:id** - Get idea by ID

### Protected Endpoints (Authentication Required)

- **POST /ideas** - Create new idea
- **PUT /ideas/:id** - Update idea (author only)
- **DELETE /ideas/:id** - Delete idea (author only)

## Authentication

The protected endpoints require a `Cookie` header with `accessToken={{access_token}}`.

To get the access token:

1. Use the Auth API endpoints to register/login
2. Extract the `accessToken` from the response cookies
3. Set it as the `access_token` environment variable

## Sample Request Bodies

### Create Idea

```json
{
  "title": "Sustainable Energy Solution",
  "slug": "sustainable-energy-solution",
  "description": "A comprehensive solution for renewable energy implementation",
  "problemStatement": "Current energy sources are depleting and causing environmental damage",
  "proposedSolution": "Implement solar and wind power infrastructure with smart grid technology",
  "images": ["https://example.com/image1.jpg"],
  "categories": ["category-id-1", "category-id-2"],
  "tags": ["tag-id-1", "tag-id-2"],
  "status": "DRAFT",
  "isPaid": false,
  "price": 0,
  "isFeatured": false
}
```

### Update Idea

```json
{
  "title": "Updated Title",
  "categories": ["category-id-1", "new-category-id"],
  "tags": ["tag-id-1", "new-tag-id"],
  "status": "UNDER_REVIEW"
}
```

## Notes

- Categories and tags are arrays of valid ID strings
- Backend validates that all provided category/tag IDs exist before creating relations
- On update, all existing category/tag relations are replaced with the new arrays
- Only the idea author can update/delete their ideas
- Slug is auto-generated if not provided
- Status enum values: DRAFT, UNDER_REVIEW, APPROVED, REJECTED
