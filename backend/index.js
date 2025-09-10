const { server } = require('./server');
const BlockchainListener = require('./services/blockchainListener');
const DomainService = require('./services/domainService');

// Initialize services
const blockchainListener = new BlockchainListener();
const domainService = new DomainService();

async function startBackend() {
  try {
    console.log('🚀 Starting Taghaus Backend Services...');
    
    // Initialize domain service
    const domainServiceInitialized = await domainService.initialize();
    if (domainServiceInitialized) {
      console.log('✅ Domain service initialized');
    } else {
      console.log('⚠️  Domain service not initialized. Check configuration.');
    }
    
    // Initialize blockchain listener
    const listenerInitialized = await blockchainListener.initialize();
    
    if (listenerInitialized) {
      // Start listening for blockchain events
      await blockchainListener.startListening();
    } else {
      console.log('⚠️  Blockchain listener not started. Deploy contracts first.');
    }
    
    // Graceful shutdown handling
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down backend services...');
      blockchainListener.stopListening();
      server.close(() => {
        console.log('✅ Backend services stopped');
        process.exit(0);
      });
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down backend services...');
      blockchainListener.stopListening();
      server.close(() => {
        console.log('✅ Backend services stopped');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to start backend services:', error);
    process.exit(1);
  }
}

// Start the backend
startBackend();
