# Event System Documentation

## Overview
The event system allows sellers to create time-limited promotional events for their products. Events are essentially products with start and end dates, enabling flash sales, limited-time offers, and seasonal promotions.

## Architecture

### Database Schema
Events are stored in the `products` table with the following event-specific fields:
- `starting_date`: DateTime - When the event begins
- `ending_date`: DateTime - When the event ends
- All other product fields (title, description, price, etc.)

### Key Components

#### 1. Event Creation (`/apps/seller-ui/src/app/(routes)/dashboard/create-event/page.tsx`)
- Form validation for dates and prices
- Real-time validation (start date must be in future, end date after start date)
- Integration with product creation API

#### 2. Event Management (`/apps/seller-ui/src/app/(routes)/dashboard/all-events/page.tsx`)
- List all seller's events with status indicators
- Real-time status calculation (Upcoming, Live, Ended)
- Actions: View, Edit, Delete

#### 3. Admin Event Management (`/apps/admin-ui/src/app/dashboard/events/page.tsx`)
- View all events across all sellers
- Export functionality
- Search and filter capabilities

#### 4. Notification System
- Real-time notifications via WebSocket
- Database notifications for persistence
- Admin notifications when events are created
- Seller notifications for event status changes

## API Endpoints

### Product Service
- `POST /product/api/create-event` - Create new event
- `GET /product/api/get-shop-events` - Get seller's events
- `DELETE /product/api/delete-event/:id` - Delete event
- `GET /product/api/get-all-events` - Get all events (admin)

### Admin Service
- `GET /admin/api/notifications` - Get admin notifications
- `GET /admin/api/notifications/stats` - Get notification statistics
- `PUT /admin/api/notifications/:id/read` - Mark notification as read
- `DELETE /admin/api/notifications/:id` - Delete notification

### Seller Service
- `GET /seller/seller-notifications` - Get seller notifications
- `GET /seller/events` - Get seller's events

## Event Status Logic

```typescript
const now = new Date();
const startDate = new Date(event.starting_date);
const endDate = new Date(event.ending_date);

if (now < startDate) {
  status = "Upcoming";
} else if (now >= startDate && now <= endDate) {
  status = "Live";
} else if (now > endDate) {
  status = "Ended";
}
```

## Notification Flow

### When Event is Created:
1. Event saved to database
2. Notification created for all admins
3. Real-time WebSocket notification sent to connected admins
4. Admin dashboard updates in real-time

### When Event Status Changes:
1. System checks event status periodically
2. Notifications sent to seller about status changes
3. Real-time updates via WebSocket

## WebSocket Integration

### Connection URLs:
- Admin: `ws://localhost:3000/ws/notifications/admin`
- Seller: `ws://localhost:3000/ws/notifications/{sellerId}`

### Message Format:
```json
{
  "type": "notification",
  "data": {
    "id": "notification_id",
    "receiverId": "user_id",
    "title": "Notification Title",
    "message": "Notification Message",
    "type": "product|order|system|general",
    "priority": "low|normal|high|urgent",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "creator": {
      "id": "creator_id",
      "name": "Creator Name",
      "email": "creator@email.com",
      "role": "admin|seller|user"
    },
    "redirect_link": "/path/to/redirect"
  }
}
```

## Frontend Components

### Seller UI
- Event creation form with validation
- Event management dashboard
- Real-time notification system
- Event status indicators

### Admin UI
- Event overview and management
- Notification center with real-time updates
- Statistics and analytics
- Event approval/rejection workflow

## Security Considerations

1. **Authentication**: All endpoints require proper authentication
2. **Authorization**: Sellers can only manage their own events
3. **Validation**: Server-side validation for all inputs
4. **Rate Limiting**: Implement rate limiting for event creation
5. **WebSocket Security**: Validate WebSocket connections

## Performance Optimizations

1. **Database Indexing**: Index on `starting_date`, `ending_date`, `shopId`
2. **Caching**: Cache frequently accessed event data
3. **Pagination**: Implement pagination for large event lists
4. **WebSocket Connection Pooling**: Manage WebSocket connections efficiently

## Future Enhancements

1. **Event Templates**: Pre-defined event templates
2. **Bulk Operations**: Bulk event creation and management
3. **Advanced Analytics**: Event performance metrics
4. **Email Notifications**: Email notifications for important events
5. **Event Scheduling**: Schedule events for future publication
6. **Event Categories**: Categorize events by type
7. **Event Collaboration**: Multi-seller events
8. **Event Recommendations**: AI-powered event suggestions

## Troubleshooting

### Common Issues:

1. **WebSocket Connection Failed**
   - Check if WebSocket server is running
   - Verify connection URL format
   - Check network connectivity

2. **Event Creation Failed**
   - Validate all required fields
   - Check date format and logic
   - Verify seller authentication

3. **Notifications Not Received**
   - Check WebSocket connection status
   - Verify notification service is running
   - Check database for notification records

4. **Event Status Not Updating**
   - Verify date comparison logic
   - Check for timezone issues
   - Ensure proper date formatting

## Testing

### Unit Tests
- Event creation validation
- Status calculation logic
- Notification service functions

### Integration Tests
- API endpoint functionality
- WebSocket communication
- Database operations

### E2E Tests
- Complete event creation flow
- Real-time notification delivery
- Admin event management workflow