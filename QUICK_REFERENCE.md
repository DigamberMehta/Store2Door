# API Standardization - Quick Reference

## 🎯 The Standardized Pattern

### Backend (Express Controllers)
```javascript
// ✅ Success Response
res.status(200).json({
  success: true,
  data: [...] // or {...}
});

// ❌ Error Response
res.status(404).json({
  success: false,
  message: "Error description"
});
```

### Frontend API Services
```javascript
// ✅ Extract data from backend response
export const exampleAPI = {
  getData: async () => {
    const response = await apiClient.get('/endpoint');
    return response.data.data; // Extract the data field
  }
};
```

### Frontend Components
```javascript
// ✅ Use data directly
const data = await exampleAPI.getData();
const items = Array.isArray(data) ? data : [];

// ❌ Don't access nested properties
// const items = data.data; // WRONG
```

## 📊 Data Flow

```
Backend                         Frontend API Service              Component
--------                        --------------------              ---------
{                               response.data.data           →    data = [...]
  success: true,           →    (extracts data)
  data: [...]
}
```

## 🔄 Migration Pattern

### Before (Inconsistent)
```javascript
// Component
const response = await api.getData();
const items = response?.data ? response.data : response || [];
```

### After (Standardized)
```javascript
// API Service
getData: async () => {
  const response = await apiClient.get('/endpoint');
  return response.data.data; // Unwrap here
}

// Component
const data = await api.getData();
const items = Array.isArray(data) ? data : []; // Use directly
```

## ✅ Checklist

### Backend
- [ ] All success responses use `{ success: true, data: ... }`
- [ ] All error responses use `{ success: false, message: ... }`
- [ ] Controllers are consistent across all endpoints

### API Services
- [ ] All methods return `response.data.data`
- [ ] Comments explain the extraction
- [ ] Error handling propagates correctly

### Components
- [ ] Receive data directly from API services
- [ ] Use `Array.isArray(data) ? data : []` for arrays
- [ ] No references to `response.data` or nested properties
- [ ] Loading states handled properly
- [ ] Error states fallback to empty arrays/objects

## 📁 Files Modified

### Backend
- No changes needed (already using correct format)

### Frontend API Services
- `frontend/src/services/api/category.api.js`
- `frontend/src/services/api/product.api.js`
- `frontend/src/services/api/store.api.js`

### Frontend Components
- `frontend/src/pages/homepage/HomePage.jsx`
- `frontend/src/pages/homepage/subCategory/GroceryKitchenSection.jsx`
- `frontend/src/pages/homepage/subCategory/SnacksDrinksSection.jsx`
- `frontend/src/pages/homepage/subCategory/BeautyPersonalCareSection.jsx`
- `frontend/src/pages/homepage/subCategory/HomeLifestyleSection.jsx`

## 🧪 Testing

```bash
# Test backend response format
curl http://localhost:3000/api/categories/grocery-kitchen/subcategories

# Expected output:
# { "success": true, "data": [...] }

# Frontend should display items correctly (no console errors)
```

## 🎉 Benefits

1. **Predictable** - Same pattern everywhere
2. **Type-safe** - Components know exactly what they receive
3. **Maintainable** - Change once in API service, not in every component
4. **Testable** - Easy to mock with plain data
5. **Clear separation** - Each layer has one responsibility

## 📚 Full Documentation

See [API_RESPONSE_FORMAT.md](./API_RESPONSE_FORMAT.md) for complete details.
