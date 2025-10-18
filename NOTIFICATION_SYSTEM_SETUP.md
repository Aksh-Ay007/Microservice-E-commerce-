# Notification System Setup Guide

## Environment Variables Required

### Admin UI (.env.local)
```env
NEXT_PUBLIC_SERVER_URI=http://localhost:8080
```

### Seller UI (.env.local)  
```env
NEXT_PUBLIC_SERVER_URI=http://localhost:8080
NEXT_PUBLIC_USER_UI_LINK=http://localhost:3000
```

### User UI (.env.local)
```env
NEXT_PUBLIC_SERVER_URI=http://localhost:8080
```

### Backend Services (.env)
```env
DATABASE_URL="your_mongodb_connection_string"
ACCESS_TOKEN_SECRET="your_access_token_secret"
REFRESH_TOKEN_SECRET="your_refresh_token_secret"
```

## Services and Ports

- **API Gateway**: http://localhost:8080
- **User UI**: http://localhost:3000  
- **Seller UI**: http://localhost:3001
- **Admin UI**: http://localhost:3002
- **Auth Service**: http://localhost:6001
- **Product Service**: http://localhost:6002
- **Order Service**: http://localhost:6003
- **Seller Service**: http://localhost:6004
- **Admin Service**: http://localhost:6005
- **Chatting Service**: http://localhost:6006
- **Kafka Service**: http://localhost:6007
- **Logger Service**: http://localhost:6008

## Database Schema Updates

The notification system uses the existing `notifications` table with these fields:

```prisma
model notifications {
  id            String               @id @default(auto()) @map("_id") @db.ObjectId
  creatorId     String               @db.ObjectId
  receiverId    String
  redirect_link String?
  title         String
  message       String
  status        notificationStatus   @default(Unread)
  type          notificationType     @default(general)
  priority      notificationPriority @default(normal)
  createdAt     DateTime             @default(now())
  updatedAt     DateTime             @updatedAt

  creator users @relation("NotificationCreator", fields: [creatorId], references: [id], onDelete: Cascade)

  @@index([receiverId, status])
  @@index([createdAt])
  @@index([type])
  @@index([priority])
}
```

## Features Implemented

### 1. Admin Notifications
- ✅ View all notifications with pagination and filtering
- ✅ Mark notifications as read/unread
- ✅ Delete notifications
- ✅ Notification statistics dashboard
- ✅ Search and filter by status, type, priority

### 2. Seller Notifications  
- ✅ Seller-specific notification page
- ✅ View notifications with pagination
- ✅ Mark as read/delete functionality
- ✅ Notification statistics
- ✅ Auto-notifications when products/events are created

### 3. Event System
- ✅ Create events (products with start/end dates)
- ✅ View all events with status (Upcoming/Active/Ended)
- ✅ Event management dashboard
- ✅ Auto-notifications to admins when events are created

### 4. Notification Creation Logic
- ✅ Automatic notifications when products are created
- ✅ Automatic notifications when events are created  
- ✅ Notification helper functions for different types
- ✅ System notifications capability

## API Endpoints

### Admin Notifications
- `GET /admin/api/notifications` - Get all notifications
- `GET /admin/api/notifications/stats` - Get notification statistics
- `PUT /admin/api/notifications/:id/read` - Mark as read
- `DELETE /admin/api/notifications/:id` - Delete notification
- `PUT /admin/api/notifications/mark-all-read` - Mark all as read

### Seller Notifications
- `GET /seller/api/seller-notifications` - Get seller notifications
- `GET /seller/api/seller-notifications/stats` - Get seller notification stats
- `PUT /seller/api/seller-notifications/:id/read` - Mark as read
- `DELETE /seller/api/seller-notifications/:id` - Delete notification
- `PUT /seller/api/seller-notifications/mark-all-read` - Mark all as read

### Events
- `POST /product/api/create-event` - Create new event
- `GET /product/api/get-shop-events` - Get seller's events
- `DELETE /product/api/delete-event/:eventId` - Delete event
- `GET /product/api/get-event-details/:slug` - Get event details

## Testing the System

### 1. Test Seller Notifications
1. Login as a seller
2. Navigate to `/dashboard/notifications`
3. Create a new product or event
4. Check if admin receives notification

### 2. Test Admin Notifications  
1. Login as an admin
2. Navigate to `/dashboard/notifications`
3. View notifications from seller activities
4. Test mark as read/delete functionality

### 3. Test Event System
1. Login as a seller
2. Navigate to `/dashboard/create-event`
3. Create a new event with start/end dates
4. Navigate to `/dashboard/all-events`
5. Verify event appears with correct status

## Troubleshooting

### Common Issues:

1. **Notifications not appearing**: Check if environment variables are set correctly
2. **API calls failing**: Verify API Gateway is running on port 8080
3. **Authentication errors**: Check if cookies are being sent with requests
4. **Database errors**: Verify MongoDB connection and schema is up to date

### Debug Steps:

1. Check browser console for JavaScript errors
2. Verify API Gateway logs for routing issues
3. Check individual service logs for backend errors
4. Verify database connections and data

## Next Steps

### Recommended Enhancements:

1. **Real-time Notifications**: Implement WebSocket for live notifications
2. **Email Notifications**: Send email alerts for important notifications
3. **Push Notifications**: Add browser push notification support
4. **Notification Templates**: Create reusable notification templates
5. **Bulk Actions**: Add bulk mark as read/delete functionality
6. **Notification Preferences**: Allow users to customize notification settings