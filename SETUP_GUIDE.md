# Complete Setup Guide for Notification & Event System

## 🚀 Quick Start

### 1. Environment Setup

Copy and configure environment variables for each service:

```bash
# Root directory
cp .env.example .env

# Admin UI
cd apps/admin-ui
cp .env.local.example .env.local

# Seller UI  
cd apps/seller-ui
cp .env.local.example .env.local

# User UI
cd apps/user-ui
cp .env.local.example .env.local
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

### 3. Database Setup

Make sure MongoDB is running and update your `DATABASE_URL` in `.env`:

```bash
# Start MongoDB (if using local installation)
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Start Services

Start all services in the correct order:

```bash
# Terminal 1 - API Gateway
cd apps/api-gateway
npm run dev

# Terminal 2 - Admin Service  
cd apps/admin-service
npm run dev

# Terminal 3 - Seller Service
cd apps/seller-service
npm run dev

# Terminal 4 - Product Service
cd apps/product-service
npm run dev

# Terminal 5 - Order Service (if needed)
cd apps/order-service
npm run dev

# Terminal 6 - Admin UI
cd apps/admin-ui
npm run dev

# Terminal 7 - Seller UI
cd apps/seller-ui
npm run dev

# Terminal 8 - User UI (if needed)
cd apps/user-ui
npm run dev
```

### 5. Verify Setup

1. **Admin UI**: http://localhost:3002
2. **Seller UI**: http://localhost:3001  
3. **User UI**: http://localhost:3000
4. **API Gateway**: http://localhost:8080

## 🧪 Testing the System

### Test Seller Notifications

1. Login as a seller at http://localhost:3001
2. Navigate to `/dashboard/notifications`
3. Create a new product or event
4. Login as admin and check notifications

### Test Admin Notifications

1. Login as admin at http://localhost:3002
2. Navigate to `/dashboard/notifications`
3. Verify notifications from seller activities
4. Test mark as read/delete functionality

### Test Event System

1. Login as seller
2. Navigate to `/dashboard/create-event`
3. Create a new event with start/end dates
4. Navigate to `/dashboard/all-events`
5. Verify event appears with correct status

## 📁 File Structure

```
apps/
├── admin-ui/src/app/dashboard/notifications/page.tsx    # Admin notifications
├── seller-ui/src/app/(routes)/dashboard/
│   ├── notifications/page.tsx                          # Seller notifications  
│   └── all-events/page.tsx                            # All events page
├── admin-service/src/
│   ├── controllers/admin.controller.ts                 # Admin notification APIs
│   └── routes/admin.route.ts                          # Admin routes
├── seller-service/src/
│   ├── controller/seller.controller.ts                 # Seller notification APIs
│   └── routes/seller.router.ts                        # Seller routes
└── product-service/src/
    ├── controllers/product.controller.ts               # Product/Event APIs
    └── routes/product-router.ts                        # Product routes

packages/
└── libs/
    └── notification-helper.ts                          # Notification utilities
```

## 🔧 Troubleshooting

### Common Issues

1. **API calls failing**
   - Check if API Gateway is running on port 8080
   - Verify environment variables are set correctly
   - Check browser console for CORS errors

2. **Notifications not appearing**
   - Verify database connection
   - Check if notification creation is working in backend logs
   - Ensure user authentication is working

3. **Events not showing**
   - Check if `starting_date` and `ending_date` are being saved
   - Verify event creation API is working
   - Check database for event records

### Debug Steps

1. **Check API Gateway logs**:
   ```bash
   cd apps/api-gateway
   npm run dev
   # Check console for routing errors
   ```

2. **Check individual service logs**:
   ```bash
   cd apps/admin-service
   npm run dev
   # Look for database connection and API errors
   ```

3. **Check browser network tab**:
   - Open DevTools → Network
   - Look for failed API calls
   - Check response status codes

4. **Check database**:
   ```bash
   # Connect to MongoDB
   mongosh
   use your_database_name
   db.notifications.find().limit(5)
   db.products.find({starting_date: {$ne: null}}).limit(5)
   ```

## 🎯 Key Features Implemented

✅ **Complete Notification System**
- Admin notification dashboard with filtering
- Seller notification management  
- Automatic notifications on product/event creation
- Mark as read/unread functionality
- Delete notifications
- Notification statistics

✅ **Enhanced Event System**
- Create events with start/end dates
- Event status tracking (Upcoming/Active/Ended)
- All events dashboard for sellers
- Event management and deletion
- Export functionality

✅ **Improved API Architecture**
- Fixed routing issues
- Added proper authentication
- Enhanced error handling
- Consistent response formats

✅ **UI/UX Improvements**
- Dark theme for seller interface
- Responsive design
- Loading states
- Toast notifications
- Better navigation

## 🔄 Next Steps

1. **Real-time Notifications**: Implement WebSocket for live updates
2. **Email Notifications**: Add email alerts for important events  
3. **Push Notifications**: Browser push notification support
4. **Advanced Filtering**: More sophisticated filtering options
5. **Bulk Operations**: Select and manage multiple notifications
6. **Notification Templates**: Reusable notification formats
7. **Analytics**: Track notification engagement and effectiveness

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify all environment variables are set
3. Ensure all services are running on correct ports
4. Check database connectivity
5. Review browser console and network logs

The system is now fully functional with professional-grade notification and event management capabilities!