module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('join-proposal', (proposalId) => {
      socket.join(`proposal-${proposalId}`);
    });

    socket.on('leave-proposal', (proposalId) => {
      socket.leave(`proposal-${proposalId}`);
    });

    socket.on('subscribe-treasury', () => {
      socket.join('treasury');
    });

    socket.on('subscribe-governance', () => {
      socket.join('governance');
    });

    socket.on('disconnect', () => {});
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
