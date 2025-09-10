const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const DomainService = require('./services/domainService');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Initialize domain service
const domainService = new DomainService();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'taghaus-backend'
  });
});

app.get('/api/contracts', (req, res) => {
  res.json({
    auctionContract: process.env.AUCTION_CONTRACT_ADDRESS,
    domainNFTContract: process.env.DOMAIN_NFT_CONTRACT_ADDRESS,
    mockNFTContract: process.env.MOCK_NFT_CONTRACT_ADDRESS,
    network: 'sepolia'
  });
});

// Domain management endpoints
app.get('/api/domains/available', async (req, res) => {
  try {
    const { owner, limit = 10 } = req.query;
    if (!owner) {
      return res.status(400).json({ error: 'Owner address required' });
    }
    
    const domains = await domainService.getAvailableDomains(owner, parseInt(limit));
    res.json({ domains });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/domains/owned/:owner', async (req, res) => {
  try {
    const { owner } = req.params;
    const { limit = 20 } = req.query;
    
    const domains = await domainService.getDomainsByOwner(owner, parseInt(limit));
    res.json({ domains });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/domains/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const domain = await domainService.getDomainDetails(tokenId);
    res.json({ domain });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/domains/test', async (req, res) => {
  try {
    const { owner, count = 5 } = req.body;
    if (!owner) {
      return res.status(400).json({ error: 'Owner address required' });
    }
    
    const domains = await domainService.createTestDomains(owner, count);
    res.json({ domains });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/domains/:tokenId/check-auction', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { owner } = req.body;
    if (!owner) {
      return res.status(400).json({ error: 'Owner address required' });
    }
    
    const result = await domainService.canCreateAuction(tokenId, owner);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join_auction', (auctionId) => {
    socket.join(`auction_${auctionId}`);
    console.log(`Client ${socket.id} joined auction ${auctionId}`);
  });
  
  socket.on('leave_auction', (auctionId) => {
    socket.leave(`auction_${auctionId}`);
    console.log(`Client ${socket.id} left auction ${auctionId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Event broadcasting functions (to be used by blockchain event listeners)
const broadcastAuctionEvent = (auctionId, eventType, data) => {
  io.to(`auction_${auctionId}`).emit('auction_event', {
    auctionId,
    eventType,
    data,
    timestamp: new Date().toISOString()
  });
};

const broadcastBidEvent = (auctionId, bidData) => {
  io.to(`auction_${auctionId}`).emit('new_bid', {
    auctionId,
    bid: bidData,
    timestamp: new Date().toISOString()
  });
};

// Export for use in other modules
module.exports = {
  app,
  server,
  io,
  broadcastAuctionEvent,
  broadcastBidEvent
};

// Start server
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`🚀 Taghaus Backend Server running on port ${PORT}`);
    console.log(`📡 WebSocket server ready for connections`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  });
}
