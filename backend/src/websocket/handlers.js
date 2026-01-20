module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-proposal', (proposalId) => {
      socket.join(`proposal-${proposalId}`);
      console.log(`Socket ${socket.id} joined proposal-${proposalId}`);
    });

    socket.on('leave-proposal', (proposalId) => {
      socket.leave(`proposal-${proposalId}`);
      console.log(`Socket ${socket.id} left proposal-${proposalId}`);
    });

    socket.on('subscribe-treasury', () => {
      socket.join('treasury');
      console.log(`Socket ${socket.id} subscribed to treasury`);
    });

    socket.on('subscribe-governance', () => {
      socket.join('governance');
      console.log(`Socket ${socket.id} subscribed to governance`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Broadcast functions
  const broadcastNewProposal = (proposal) => {
    io.to('governance').emit('new-proposal', proposal);
  };

  const broadcastNewVote = (proposalId, vote) => {
    io.to(`proposal-${proposalId}`).emit('new-vote', vote);
  };

  const broadcastTreasuryUpdate = (transaction) => {
    io.to('treasury').emit('treasury-update', transaction);
  };

  const broadcastProposalStateChange = (proposalId, newState) => {
    io.to(`proposal-${proposalId}`).emit('state-change', { proposalId, newState });
  };

  return {
    broadcastNewProposal,
    broadcastNewVote,
    broadcastTreasuryUpdate,
    broadcastProposalStateChange
  };
};
