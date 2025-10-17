import prisma from '@packages/libs/prisma';
import cron from 'node-cron';

cron.schedule('0 * * * *', async () => {
   try {
      console.log('Starting product deletion cron job...');
      const now = new Date();
      
      // First, get the products that will be deleted for logging
      const productsToDelete = await prisma.products.findMany({
         where: {
            isDeleted: true,
            deletedAt: {
               lte: now,
            },
         },
         select: {
            id: true,
            title: true,
            deletedAt: true,
         },
      });

      if (productsToDelete.length > 0) {
         console.log(`Found ${productsToDelete.length} products to delete:`, 
            productsToDelete.map(p => ({ id: p.id, title: p.title, deletedAt: p.deletedAt }))
         );

         // Delete the products
         const deleteResult = await prisma.products.deleteMany({
            where: {
               isDeleted: true,
               deletedAt: {
                  lte: now,
               },
            },
         });

         console.log(`Successfully deleted ${deleteResult.count} products`);
      } else {
         console.log('No products found for deletion');
      }

   } catch (error) {
      console.error('Error during product deletion cron job:', error);
      // In production, you might want to send this to a monitoring service
      // or retry mechanism
   }
});
