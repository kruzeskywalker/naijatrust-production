/**
 * Cron Jobs for Subscription Management
 * Run this script periodically to process trials and renewals
 */

const cron = require('node-cron');
const subscriptionUtils = require('./utils/subscriptionUtils');

// Process expired trials daily at 2 AM
const processTrialsJob = cron.schedule('0 2 * * *', async () => {
    console.log('🔄 Running trial expiration check...');
    try {
        const count = await subscriptionUtils.processExpiredTrials();
        console.log(`✅ Processed ${count} expired trials`);
    } catch (error) {
        console.error('❌ Error processing trials:', error);
    }
}, {
    scheduled: false,
    timezone: "Africa/Lagos"
});

// Process renewals daily at 3 AM
const processRenewalsJob = cron.schedule('0 3 * * *', async () => {
    console.log('🔄 Running renewal check...');
    try {
        const count = await subscriptionUtils.processRenewals();
        console.log(`✅ Processed ${count} renewals`);
    } catch (error) {
        console.error('❌ Error processing renewals:', error);
    }
}, {
    scheduled: false,
    timezone: "Africa/Lagos"
});

// Start all cron jobs
function startCronJobs() {
    console.log('⏰ Starting subscription cron jobs...');
    processTrialsJob.start();
    processRenewalsJob.start();
    console.log('✅ Cron jobs started successfully');
}

// Stop all cron jobs
function stopCronJobs() {
    console.log('⏸️  Stopping subscription cron jobs...');
    processTrialsJob.stop();
    processRenewalsJob.stop();
    console.log('✅ Cron jobs stopped');
}

// Manual trigger functions (for testing)
async function manualProcessTrials() {
    console.log('🔄 Manually processing expired trials...');
    try {
        const count = await subscriptionUtils.processExpiredTrials();
        console.log(`✅ Processed ${count} expired trials`);
        return count;
    } catch (error) {
        console.error('❌ Error processing trials:', error);
        throw error;
    }
}

async function manualProcessRenewals() {
    console.log('🔄 Manually processing renewals...');
    try {
        const count = await subscriptionUtils.processRenewals();
        console.log(`✅ Processed ${count} renewals`);
        return count;
    } catch (error) {
        console.error('❌ Error processing renewals:', error);
        throw error;
    }
}

module.exports = {
    startCronJobs,
    stopCronJobs,
    manualProcessTrials,
    manualProcessRenewals
};

// If run directly, start cron jobs
if (require.main === module) {
    const mongoose = require('mongoose');
    require('dotenv').config();

    mongoose.connect(process.env.MONGODB_URI)
        .then(() => {
            console.log('✅ Connected to MongoDB');
            startCronJobs();

            // Keep process running
            process.on('SIGINT', () => {
                stopCronJobs();
                mongoose.connection.close();
                process.exit(0);
            });
        })
        .catch(err => {
            console.error('❌ MongoDB connection error:', err);
            process.exit(1);
        });
}
