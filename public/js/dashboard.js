// Dashboard functionality
document.addEventListener("DOMContentLoaded", function () {
  console.log("PUBLIC FOLDER VERSION - CONSOLIDATED");
  console.log("Dashboard JS is running");
  
  // Check authentication before proceeding
  if (!window.requireAuth()) return;
  
  setupSidebarNavigation();
  loadUserData();
  loadProposals();
});

// Load user data from token and update UI
function loadUserData() {
  window.ProposalMateAPI.auth.getCurrentUser()
    .then(data => {
      console.log("User data received:", data);
      
      // Update user name in the sidebar
      const nameElement = document.getElementById("user-name");
      if (nameElement && data && data.data && data.data.name) {
        console.log("Setting user name to:", data.data.name);
        nameElement.textContent = data.data.name;
      } else {
        console.error("Could not update user name. Element or data missing:", {
          elementExists: !!nameElement,
          dataExists: !!data,
          dataDataExists: data && !!data.data,
          nameExists: data && data.data && !!data.data.name
        });
      }
    })
    .catch(err => {
      console.error("Failed to load user data:", err);
    });
}

// Load proposals from API
function loadProposals() {
  window.ProposalMateAPI.proposals.getAll()
    .then(response => {
      const container = document.querySelector(".proposal-list");
      if (!container) {
        console.error("Proposal list container not found");
        return;
      }
      
      container.innerHTML = "";
      
      const proposals = response.data || [];
      
      if (proposals.length === 0) {
        container.innerHTML = "<p>No proposals yet. Create your first proposal!</p>";
        
        // Update stats to show zeros
        updateStats(0, 0, 0, 0);
        return;
      }

      // Count proposals by status
      let sent = 0, viewed = 0, accepted = 0;
      
      proposals.forEach(proposal => {
        // Count by status
        if (proposal.status === 'sent') sent++;
        if (proposal.status === 'viewed') viewed++;
        if (proposal.status === 'accepted') accepted++;
        
        const div = document.createElement("div");
        div.classList.add("proposal-item");
        div.innerHTML = `
          <div class="proposal-info">
            <div class="proposal-title">${proposal.title || 'Untitled Proposal'}</div>
            <div class="proposal-date">Created: ${new Date(proposal.createdAt).toLocaleDateString()}</div>
          </div>
          <div class="proposal-status status-${proposal.status || 'draft'}">${proposal.status || 'Draft'}</div>
          <div class="proposal-actions">
            <a href="/pages/view-proposal.html?id=${proposal._id}" class="btn-icon"><i class="fas fa-eye"></i></a>
            <a href="/pages/edit-proposal.html?id=${proposal._id}" class="btn-icon"><i class="fas fa-edit"></i></a>
            <a href="#" class="btn-icon" onclick="deleteProposal('${proposal._id}')"><i class="fas fa-trash"></i></a>
          </div>
        `;
        container.appendChild(div);
      });
      
      // Update stats
      updateStats(proposals.length, sent, viewed, accepted);
    })
    .catch(err => {
      console.error("Failed to load proposals:", err);
      const container = document.querySelector(".proposal-list");
      if (container) {
        container.innerHTML = "<p>Error loading proposals. Please try again later.</p>";
      }
      
      // Reset stats on error
      updateStats(0, 0, 0, 0);
    });
}

// Update dashboard statistics
function updateStats(total, sent, viewed, accepted) {
  const totalElement = document.querySelector(".stat-totalProposals");
  const sentElement = document.querySelector(".stat-sentProposals");
  const viewedElement = document.querySelector(".stat-viewedProposals");
  const acceptedElement = document.querySelector(".stat-acceptedProposals");
  
  if (totalElement) totalElement.textContent = total;
  if (sentElement) sentElement.textContent = sent;
  if (viewedElement) viewedElement.textContent = viewed;
  if (acceptedElement) acceptedElement.textContent = accepted;
}

// Setup sidebar navigation
function setupSidebarNavigation() {
  const links = document.querySelectorAll('.dashboard-link');
  
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      if (this.textContent === 'Logout') {
        e.preventDefault();
        logout();
      }
    });
  });
}

// Handle logout
function logout() {
  localStorage.removeItem('token');
  window.location.href = '/pages/login.html';
}

// Delete proposal
function deleteProposal(id) {
  if (!confirm('Are you sure you want to delete this proposal?')) {
    return;
  }
  
  window.ProposalMateAPI.proposals.delete(id)
    .then(() => {
      // Reload proposals after successful deletion
      loadProposals();
    })
    .catch(err => {
      console.error('Error deleting proposal:', err);
      alert('Failed to delete proposal. Please try again.');
    });
}
