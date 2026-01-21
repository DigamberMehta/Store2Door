# API Response Format Documentation

## Standardized Response Structure

This document defines the consistent format for all API communications between backend and frontend.

---

## Backend Response Format

### Success Response

All successful API responses follow this structure:

```json
{
  "success": true,
  "data": [...] | {...}
}
```

### Error Response

All error responses follow this structure:

```json
{
  "success": false,
  "message": "Error description",
  "error": {...} // Optional: detailed error object
}
```

### Paginated Response

For endpoints that support pagination:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

## Frontend API Service Layer

### Responsibility

API services extract and return ONLY the `data` field from backend responses.

### Pattern

```javascript
export const exampleAPI = {
  getData: async () => {
    const response = await apiClient.get("/endpoint");
    return response.data.data; // Extract data from { success: true, data: [...] }
  },
};
```

### What Happens

1. **Backend returns**: `{ success: true, data: [...] }`
2. **Axios wraps it**: `{ data: { success: true, data: [...] } }`
3. **API service extracts**: `response.data.data` → Returns `[...]` (actual data)
4. **Components receive**: The unwrapped data directly

---

## Frontend Component Layer

### Responsibility

Components receive the actual data (array or object) directly from API services.

### Pattern

```javascript
const MyComponent = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // API service returns unwrapped data array directly
        const data = await someAPI.getData();

        // data is already the array/object, no need to access .data
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error:", error);
        setItems([]);
      }
    };

    fetchData();
  }, []);
};
```

### ❌ INCORRECT (Old Pattern)

```javascript
const data = await someAPI.getData();
const items = data.data; // NO - data is already unwrapped
```

### ✅ CORRECT (New Pattern)

```javascript
const data = await someAPI.getData();
const items = Array.isArray(data) ? data : []; // YES - data is the array
```

---

## Data Flow Diagram

```
Backend                 Axios                  API Service           Component
--------               --------               -------------         -----------
{ success: true,  →    { data: {         →    return           →   const data =
  data: [...] }          success: true,         response.data.       await api.get()
                         data: [...] }          data
                       }                                             // data = [...]
```

---

## Examples by Service

### Category API

```javascript
// API Service
export const categoryAPI = {
  getSubcategories: async (parentSlug) => {
    const response = await apiClient.get(
      `/categories/${parentSlug}/subcategories`
    );
    return response.data.data; // Returns array of subcategories
  },
};

// Component
const data = await categoryAPI.getSubcategories("grocery-kitchen");
// data = [{ _id: "...", name: "Rice", ... }, ...]
```

### Product API

```javascript
// API Service
export const productAPI = {
  getByCategory: async (categorySlug) => {
    const response = await apiClient.get(`/products/category/${categorySlug}`);
    return response.data.data; // Returns array of products
  },
};

// Component
const products = await productAPI.getByCategory("rice");
// products = [{ _id: "...", name: "Basmati Rice", ... }, ...]
```

### Store API

```javascript
// API Service
export const storeAPI = {
  getAll: async (filters = {}) => {
    const response = await apiClient.get("/stores", { params: filters });
    return response.data.data; // Returns array of stores
  },
};

// Component
const stores = await storeAPI.getAll({ limit: 50 });
// stores = [{ _id: "...", name: "Store A", ... }, ...]
```

---

## Benefits of This Approach

1. **Separation of Concerns**

   - Backend: Focuses on business logic and data structure
   - API Services: Handle HTTP communication and unwrapping
   - Components: Work with clean, unwrapped data

2. **Type Safety**

   - Components always receive the expected data type
   - No confusion about response.data vs response.data.data

3. **Error Handling**

   - Consistent error format across all endpoints
   - Easy to implement global error interceptors

4. **Maintainability**

   - Single point of change if backend format changes
   - Clear contract between layers

5. **Testing**
   - Easy to mock API services with plain data
   - Components don't need to know about HTTP details

---

## Implementation Checklist

### Backend Controllers

- ✅ All success responses use `{ success: true, data: ... }`
- ✅ All error responses use `{ success: false, message: ..., error: ... }`
- ✅ Paginated responses include `pagination` field

### Frontend API Services

- ✅ All methods extract data with `return response.data.data`
- ✅ Comments explain the extraction pattern
- ✅ Consistent error propagation

### Frontend Components

- ✅ Receive data directly from API services
- ✅ Use `Array.isArray(data) ? data : []` for safety
- ✅ No references to `response.data` or nested properties
- ✅ Proper error handling with empty state fallbacks

---

## Migration Guide

If you find code using the old pattern:

### Old Pattern (Inconsistent)

```javascript
// Component
const response = await api.getData();
const items = response?.data ? response.data : response || [];
```

### New Pattern (Standardized)

```javascript
// Component
const data = await api.getData(); // API service already unwrapped it
const items = Array.isArray(data) ? data : [];
```

---

## Questions & Troubleshooting

### Q: What if the API service returns undefined?

**A:** The API service should handle errors and either throw or return empty array/object. Components use fallbacks: `Array.isArray(data) ? data : []`

### Q: Can I access the success field in components?

**A:** No. API services extract only the data. If you need success status, check for errors or handle them in the API service layer.

### Q: What about pagination data?

**A:** For paginated endpoints, return an object: `{ items: response.data.data, pagination: response.data.pagination }`

### Q: How do I know if an endpoint is paginated?

**A:** Check the backend controller. If it returns a `pagination` field, the API service should return both data and pagination.

---

Last Updated: January 21, 2026
