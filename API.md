# IntelliPrep API Documentation

Complete API reference for IntelliPrep backend.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, IntelliPrep uses no authentication. Future versions will include user authentication.

## Response Format

All responses are JSON:

```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

## Endpoints

### Interviews

#### Get All Interviews
```
GET /interviews
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "interviews": [
    {
      "id": "interview_1234567890",
      "role": "Senior Developer",
      "responses": ["...", "..."],
      "createdAt": "2026-09-01T10:00:00Z",
      "updatedAt": "2026-09-01T10:30:00Z"
    }
  ]
}
```

#### Get Single Interview
```
GET /interviews/:id
```

**Parameters:**
- `id` (string) - Interview ID

**Response:**
```json
{
  "success": true,
  "interview": {
    "id": "interview_1234567890",
    "role": "Senior Developer",
    "responses": ["...", "..."],
    "createdAt": "2026-09-01T10:00:00Z"
  }
}
```

#### Create Interview
```
POST /interviews
```

**Body:**
```json
{
  "role": "Senior Developer",
  "responses": ["Answer 1", "Answer 2"],
  "score": 85
}
```

**Response:**
```json
{
  "success": true,
  "message": "Interview created successfully.",
  "interview": {
    "id": "interview_1234567890",
    "role": "Senior Developer",
    "responses": ["Answer 1", "Answer 2"],
    "score": 85,
    "createdAt": "2026-09-01T10:00:00Z",
    "updatedAt": "2026-09-01T10:00:00Z"
  }
}
```

### AI Interview

#### Start Interview
```
POST /ai/interview
```

**Body:**
```json
{
  "action": "startInterview",
  "role": "Senior Developer",
  "jobDescription": "Looking for a senior developer with 5+ years experience...",
  "resumeId": "resume_123" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "question": "Tell me about your experience with Node.js?",
  "totalQuestions": 10,
  "resumeId": "resume_123"
}
```

#### Submit Answer
```
POST /ai/interview
```

**Body:**
```json
{
  "action": "submitAnswer",
  "role": "Senior Developer",
  "jobDescription": "...",
  "question": "Tell me about your experience with Node.js?",
  "answer": "I have 7 years of experience with Node.js...",
  "conversationHistory": [...]
}
```

**Response:**
```json
{
  "success": true,
  "question": "Next question...",
  "evaluation": "Good answer that demonstrates...",
  "questionNumber": 2,
  "totalQuestions": 10
}
```

#### Get Evaluation
```
POST /ai/interview
```

**Body:**
```json
{
  "action": "evaluate",
  "role": "Senior Developer",
  "jobDescription": "...",
  "conversation": [...]
}
```

**Response:**
```json
{
  "success": true,
  "evaluation": "Overall assessment of interview performance...",
  "score": 82,
  "strengths": ["Good communication", "Technical knowledge"],
  "improvements": ["Be more specific about projects"]
}
```

### Resumes

#### Get All Resumes
```
GET /resumes
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "resumes": [
    {
      "id": "resume_123",
      "filename": "resume.pdf",
      "size": 245000,
      "uploadedAt": "2026-09-01T10:00:00Z"
    }
  ]
}
```

#### Get Single Resume
```
GET /resumes/:id
```

**Response:**
```json
{
  "success": true,
  "resume": {
    "id": "resume_123",
    "filename": "resume.pdf",
    "content": "base64-encoded-content",
    "size": 245000,
    "uploadedAt": "2026-09-01T10:00:00Z"
  }
}
```

#### Upload Resume
```
POST /resumes
Content-Type: multipart/form-data
```

**Form Data:**
- `resume` (file) - PDF, DOC, or DOCX file

**Response:**
```json
{
  "success": true,
  "message": "Resume uploaded successfully.",
  "resume": {
    "id": "resume_123",
    "filename": "resume.pdf",
    "size": 245000,
    "uploadedAt": "2026-09-01T10:00:00Z"
  }
}
```

#### Delete Resume
```
DELETE /resumes/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Resume deleted successfully."
}
```

## Error Responses

### Bad Request (400)
```json
{
  "success": false,
  "message": "Role and job description are required."
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Interview not found."
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Rate Limiting

Currently no rate limiting is implemented. Production deployments should implement rate limiting.

## Pagination

Endpoints returning lists support pagination:

```
GET /interviews?page=1&limit=10
```

## Filtering

Not yet implemented. Future versions will support filtering and searching.

## Sorting

Not yet implemented. Future versions will support sorting.

## Best Practices

1. **Always check the `success` field** - Indicates if request succeeded
2. **Handle errors gracefully** - Display error messages to users
3. **Use appropriate HTTP methods** - GET for retrieval, POST for creation
4. **Validate inputs** - Client-side and server-side validation
5. **Cache responses when appropriate** - Improve performance

## Changelog

### v1.0.0 (2026-09-01)
- Initial API release
- Basic interview endpoints
- Resume management
- AI question generation

### Future
- [ ] Pagination support
- [ ] Filtering and searching
- [ ] User authentication
- [ ] Rate limiting
- [ ] API versioning
- [ ] WebSocket support for real-time updates

## Support

For API issues or questions, please open an issue on GitHub.
