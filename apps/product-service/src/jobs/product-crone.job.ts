import prisma from '@packages/libs/prisma';
import cron from 'node-cron';

// Job 1: Delete soft-deleted products/events after 24 hours
cron.schedule('0 * * * *', async () => {
   try {
      const now = new Date();
      const result = await prisma.products.deleteMany({
         where: {
             isDeleted: true,
             deletedAt: {
                 lte: now,
             },
         },
      });
      
      if (result.count > 0) {
         console.log(`🗑️ Deleted ${result.count} soft-deleted products/events`);
      }
   } catch (error) {
      console.error('Error during product deletion cron job:', error);
   }
});

// Job 2: Automatically delete events that have passed their ending_date
cron.schedule('0 * * * *', async () => {
   try {
      const now = new Date();
      
      // Find active events where ending_date has passed (only non-deleted events)
      const result = await prisma.products.deleteMany({
         where: {
             ending_date: {
                 lt: now, // Ending date is before now
             },
             starting_date: {
                 not: null, // This is an event
             },
             isDeleted: false, // Only delete active (non-deleted) events
         },
      });
      
      if (result.count > 0) {
         console.log(`🎉 Automatically deleted ${result.count} expired events`);
      }
   } catch (error) {
      console.error('Error during event expiration cron job:', error);
   }
});
