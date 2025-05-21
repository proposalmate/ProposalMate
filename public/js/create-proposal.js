// Create proposal functionality
document.addEventListener('DOMContentLoaded', function() {
  // Check authentication before proceeding
  if (!window.requireAuth()) return;
  
  setupCreateProposalForm();
});

function setupCreateProposalForm() {
  const form = document.getElementById('create-proposal-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const title = document.getElementById('proposal-title').value.trim();
    const clientName = document.getElementById('proposal-client').value.trim();
    const template = document.getElementById('proposal-template').value;
    const dueDate = document.getElementById('proposal-due-date').value;

    // Validate required fields
    if (!title || !clientName || !template) {
      alert('Please fill in all required fields.');
      return;
    }

    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Creating...';
    submitButton.disabled = true;

    // Create proposal object
    const proposalData = {
      title,
      clientName,
      template,
      dueDate,
      content: {
        template,
        dueDate
      }
    };

    // Use the API utility to create the proposal
    window.ProposalMateAPI.proposals.create(proposalData)
      .then(data => {
        console.log('Proposal created successfully:', data);
        alert('Proposal created successfully!');
        window.location.href = 'dashboard.html';
      })
      .catch(error => {
        console.error('Error creating proposal:', error);
        alert('Failed to create proposal. Please try again.');
        submitButton.textContent = originalText;
        submitButton.disabled = false;
      });
  });
}
