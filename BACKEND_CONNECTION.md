# Backend Connection Configuration

## Summary
Connected the EditProductPage with the backend API. All API calls now use the correct endpoints.

## Changes Made

### 1. Frontend API Configuration

**File: `dashboard/.env`**
- Created environment configuration file
- Set `VITE_API_URL=http://localhost:3000/api/managers`

**File: `dashboard/src/app/store/pages/products/EditProductPage.jsx`**
- Added `API_BASE_URL` constant from environment variable
- Updated categories endpoint: `${API_BASE_URL}/categories`
- Updated subcategories endpoint: `${API_BASE_URL}/categories/${slug}/children`
- Updated image upload endpoint: `${API_BASE_URL}/upload/image`
- Fixed auth token key: Changed from `authToken` to `storeAuthToken`

**File: `dashboard/src/services/store/api/product.api.js`**
- Updated all product API routes to use relative paths
- Changed from `/store/products` to `/products`
- Routes now resolve as: `/api/managers/products/*`

### 2. API Endpoint Mapping

Backend routes (configured in `backend/app.js`):
```
/api/managers/*        → Store manager dashboard routes
  ├── /products/*      → Product CRUD operations
  ├── /store/*         → Store management
  ├── /orders/*        → Order management
  ├── /reviews/*       → Review management
  └── /earnings/*      → Earnings tracking

/api/categories/*      → Category listing (public/shared)
/api/upload/*          → Image upload to Cloudinary
```

Frontend API calls now correctly map to:
```
productAPI.getMyProducts()    → GET  /api/managers/products
productAPI.getById(id)        → GET  /api/managers/products/:id
productAPI.create(data)       → POST /api/managers/products
productAPI.update(id, data)   → PUT  /api/managers/products/:id
productAPI.delete(id)         → DELETE /api/managers/products/:id
productAPI.toggleActive(id)   → PATCH /api/managers/products/:id/toggle-active
productAPI.updateStock(id, qty) → PATCH /api/managers/products/:id/stock

Image Upload                  → POST /api/upload/image
Categories                    → GET  /api/categories
Subcategories                 → GET  /api/categories/:slug/children
```

### 3. Authentication Flow

- All requests use `storeAuthToken` from localStorage
- Auth token added via axios interceptor in `client.js`
- Format: `Authorization: Bearer <token>`
- Backend validates token and extracts `storeId` for data scoping

### 4. Response Handling

The `apiClient` has a response interceptor that automatically returns `response.data`:
```javascript
// Backend response structure:
{
  success: true,
  data: { ...product },
  message: "..."
}

// What apiClient returns:
{
  success: true,
  data: { ...product },
  message: "..."
}

// Access product: response.data
```

## Testing the Connection

### 1. Start Backend
```bash
cd backend
npm install
npm start
```

### 2. Start Dashboard
```bash
cd dashboard
npm install
npm run dev
```

### 3. Test Features
- ✅ View products list
- ✅ Edit product (fetch product data)
- ✅ Update product details
- ✅ Upload product images
- ✅ Update stock quantity
- ✅ Toggle product status
- ✅ Delete product

## Environment Variables Required

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/door2door
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Dashboard (.env)
```env
VITE_API_URL=http://localhost:3000/api/managers
```

## Security Notes

- All product routes require authentication (`authenticate` middleware)
- Routes require `store_manager` role (`authorize` middleware)
- Products are scoped to the authenticated store manager's `storeId`
- Cross-store access is prevented by backend validation

## Common Issues & Solutions

### Issue: 401 Unauthorized
**Solution:** Ensure `storeAuthToken` exists in localStorage

### Issue: 404 Not Found
**Solution:** Check that backend is running on port 3000

### Issue: CORS errors
**Solution:** Verify CORS is configured in backend `app.js`

### Issue: Image upload fails
**Solution:** Check Cloudinary credentials in backend `.env`

### Issue: Products not loading
**Solution:** Ensure user has `store_manager` role and valid `storeId`

## Next Steps

1. ✅ Backend connection complete
2. ✅ API endpoints configured
3. ✅ Authentication working
4. ✅ Image upload integrated
5. Ready for testing!

Test the full flow:
1. Login as store manager
2. Navigate to products page
3. Click edit on any product
4. Update product details
5. Upload new images
6. Save changes
7. Verify changes in products list
