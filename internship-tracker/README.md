# Internship Tracker

## Project Structure

```text
/internship-tracker
  /backend
    server.js
    /models
      Internship.js
    /routes
      internships.js
    /seed
      sampleData.js
  /frontend
    index.html
    style.css
    script.js
  package.json
  .env.example
  README.md
```

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Configure MongoDB

1. Make sure MongoDB is installed and running locally.
2. Copy `.env.example` to `.env`.
3. Update `MONGODB_URI` if your MongoDB connection string is different.

Example:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/internship-tracker
```

### 3. Run the application

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

### 4. Open the app

```text
http://localhost:5000
```

## API Endpoints

- `GET /api/internships`
- `GET /api/internships/:id`
- `POST /api/internships`
- `PUT /api/internships/:id`
- `DELETE /api/internships/:id`

## Notes

- The server automatically seeds sample internship data when the database is empty.
- The frontend refreshes internship data every 15 seconds to simulate real-time updates.
- Chart.js is loaded from CDN for analytics charts.
