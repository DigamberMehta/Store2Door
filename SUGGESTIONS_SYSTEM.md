# Suggestions System

A comprehensive search suggestions system with Elasticsearch indexing and Redis caching.

## Features

- **Real-time Suggestions**: Get instant suggestions as you type
- **Multiple Sources**: Search across products, stores, and categories
- **Smart Caching**: Redis-powered caching for faster responses
- **Elasticsearch**: Full-text search with fuzzy matching and edge n-grams
- **Popular/Trending**: Show popular and trending searches
- **Recent Searches**: Track user's recent searches (authenticated users)
- **Fallback Search**: MongoDB fallback when Elasticsearch is unavailable

## Backend API

### Endpoints

#### Get Suggestions
```
GET /api/suggestions?q={query}&type={type}&limit={limit}
```

**Parameters:**
- `q` (required): Search query (minimum 2 characters)
- `type` (optional): Filter by type (`product`, `store`, `category`)
- `limit` (optional): Number of results (default: 10)

**Response:**
```json
{
  "success": true,
  "query": "milk",
  "suggestions": {
    "products": [...],
    "stores": [...],
    "categories": [...],
    "all": [...]
  }
}
```

#### Get Popular Searches
```
GET /api/suggestions/popular?limit={limit}
```

#### Get Trending Searches
```
GET /api/suggestions/trending?limit={limit}
```

#### Get Recent Searches (Authenticated)
```
GET /api/suggestions/recent?limit={limit}
```

#### Clear Cache (Admin)
```
DELETE /api/suggestions/cache?pattern={pattern}
```

## Architecture

### Backend Components

1. **Elasticsearch Configuration** (`config/elasticsearch.js`)
   - Client initialization
   - Index management
   - Search queries with edge n-grams
   - Bulk indexing support

2. **Redis Configuration** (`config/redis.js`)
   - Client initialization
   - Cache helper functions
   - Automatic reconnection
   - Graceful shutdown

3. **Suggestions Service** (`services/suggestionsService.js`)
   - Main business logic
   - Caching layer
   - Fallback search
   - Analytics tracking

4. **Suggestions Controller** (`controllers/suggestionsController.js`)
   - Request handling
   - Validation
   - Response formatting

5. **Routes** (`routes/suggestions.js`)
   - API endpoint definitions
   - Public and protected routes

### Frontend Components

1. **SuggestionsDropdown Component** (`components/SuggestionsDropdown.jsx`)
   - Dropdown UI
   - Debounced search
   - Result grouping
   - Popular/trending display

2. **Suggestions API** (`services/api/suggestions.api.js`)
   - API client methods
   - Error handling

3. **Integration**
   - SearchPage: Full search experience
   - Header: Quick search from anywhere

## Environment Variables

Add these to your `.env` file:

```env
# Elasticsearch (optional)
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_AUTH=false
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

## Installation & Setup

### 1. Install Dependencies

Already installed:
- `@elastic/elasticsearch`
- `redis`

### 2. Start Services

**Option A: Using Docker (Recommended)**
```bash
# Start Elasticsearch and Redis
docker-compose up -d elasticsearch redis
```

**Option B: Manual Installation**

**Elasticsearch:**
```bash
# Download and extract Elasticsearch
# Visit: https://www.elastic.co/downloads/elasticsearch
# Or use package manager:
brew install elasticsearch  # macOS
sudo apt install elasticsearch  # Ubuntu
```

**Redis:**
```bash
brew install redis  # macOS
sudo apt install redis-server  # Ubuntu
```

### 3. Initialize Suggestions Index

The index will be automatically created when the server starts. To manually populate:

```javascript
// Create a script: scripts/populateSuggestions.js
import Product from '../models/Product.js';
import Store from '../models/Store.js';
import { bulkIndexSuggestions } from '../config/elasticsearch.js';

const products = await Product.find({ isActive: true }).lean();
const stores = await Store.find({ isActive: true }).lean();

const documents = [
  ...products.map(p => ({ ...p, type: 'product' })),
  ...stores.map(s => ({ ...s, type: 'store' }))
];

await bulkIndexSuggestions(documents);
```

### 4. Optional: Docker Compose Setup

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - es_data:/usr/share/elasticsearch/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  es_data:
  redis_data:
```

## Usage Examples

### Frontend

```jsx
import suggestionsAPI from '../services/api/suggestions.api';

// Get suggestions
const results = await suggestionsAPI.getSuggestions('milk', {
  type: 'product',
  limit: 10
});

// Get popular searches
const popular = await suggestionsAPI.getPopularSearches(5);

// Get trending
const trending = await suggestionsAPI.getTrendingSearches(5);

// Get recent (authenticated)
const recent = await suggestionsAPI.getRecentSearches(5);
```

### Backend Service Hooks

Add to product/store controllers to auto-index:

```javascript
// After creating product
import { indexSuggestion } from '../config/elasticsearch.js';
await indexSuggestion('product', newProduct);

// After updating
import { updateSuggestion } from '../config/elasticsearch.js';
await updateSuggestion('product', updatedProduct);

// After deleting
import { deleteSuggestion } from '../config/elasticsearch.js';
await deleteSuggestion('product', productId);
```

## Cache Strategy

- **Suggestions**: 5 minutes
- **Popular searches**: 1 hour
- **Trending searches**: 30 minutes
- **Recent searches**: 7 days

## Performance Notes

- Elasticsearch is **optional** - system falls back to MongoDB if unavailable
- Redis is **optional** - system works without caching (slower)
- Suggestions are debounced (300ms) on frontend
- Results are cached by query + filters
- Auto-complete uses edge n-grams (2-20 characters)

## Monitoring

Check service status:

```bash
# Elasticsearch
curl http://localhost:9200/_cluster/health

# Redis
redis-cli ping
```

## Troubleshooting

If suggestions don't work:
1. Check backend logs for Elasticsearch/Redis connection warnings
2. System will automatically fallback to MongoDB search
3. Verify environment variables are set correctly
4. Check if services are running: `docker ps` or service status

## Future Enhancements

- [ ] Add search analytics dashboard
- [ ] Implement A/B testing for suggestion ranking
- [ ] Add ML-based personalized suggestions
- [ ] Implement query spelling corrections
- [ ] Add voice search support
- [ ] Create admin panel for suggestion management
