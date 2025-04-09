// ProposalMate Dashboard Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard components if on dashboard page
    if (document.querySelector('.dashboard')) {
        initDashboardCharts();
        setupProposalFilters();
        setupCreateProposalForm();
    }
});

// Initialize dashboard charts and statistics
function initDashboardCharts() {
    // This would typically use a charting library like Chart.js
    // For this demo, we'll simulate chart data
    
    // Simulate proposal status chart
    const statusChartElement = document.getElementById('proposal-status-chart');
    if (statusChartElement) {
        // In a real implementation, this would create a chart using Chart.js or similar
        statusChartElement.innerHTML = `
            <div class="chart-placeholder">
                <div class="chart-bar" style="height: 60%; background-color: var(--primary-color);" title="Sent: 5"></div>
                <div class="chart-bar" style="height: 40%; background-color: var(--accent-color);" title="Viewed: 3"></div>
                <div class="chart-bar" style="height: 30%; background-color: var(--secondary-accent);" title="Accepted: 2"></div>
                <div class="chart-bar" style="height: 20%; background-color: #e0e0e0;" title="Draft: 2"></div>
            </div>
            <div class="chart-legend">
                <div class="legend-item"><span class="color-box" style="background-color: var(--primary-color);"></span> Sent</div>
                <div class="legend-item"><span class="color-box" style="background-color: var(--accent-color);"></span> Viewed</div>
                <div class="legend-item"><span class="color-box" style="background-color: var(--secondary-accent);"></span> Accepted</div>
                <div class="legend-item"><span class="color-box" style="background-color: #e0e0e0;"></span> Draft</div>
            </div>
        `;
    }
    
    // Update dashboard statistics
    updateDashboardStats();
}

// Update dashboard statistics
function updateDashboardStats() {
    // In a real implementation, this would fetch data from an API
    const stats = {
        totalProposals: 12,
        sentProposals: 5,
        viewedProposals: 3,
        acceptedProposals: 2,
        conversionRate: '40%',
        averageValue: '£1,250'
    };
    
    // Update stat cards
    Object.keys(stats).forEach(key => {
        const element = document.querySelector(`.stat-${key}`);
        if (element) {
            element.textContent = stats[key];
        }
    });
}

// Setup proposal filtering
function setupProposalFilters() {
    const filterButtons = document.querySelectorAll('.proposal-filter');
    const proposalItems = document.querySelectorAll('.proposal-item');
    
    if (filterButtons.length) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Get filter value
                const filter = this.getAttribute('data-filter');
                
                // Filter proposals
                proposalItems.forEach(item => {
                    if (filter === 'all') {
                        item.style.display = 'flex';
                    } else {
                        const status = item.querySelector('.proposal-status').classList[1];
                        if (status === `status-${filter}`) {
                            item.style.display = 'flex';
                        } else {
                            item.style.display = 'none';
                        }
                    }
                });
            });
        });
    }
}

// Setup create proposal form
function setupCreateProposalForm() {
    const createProposalBtn = document.querySelector('.btn-create-proposal');
    
    if (createProposalBtn) {
        createProposalBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // In a real implementation, this would open a form or redirect to a create page
            // For this demo, we'll show a modal
            showCreateProposalModal();
        });
    }
}

// Show create proposal modal
function showCreateProposalModal() {
    // Create modal if it doesn't exist
    if (!document.querySelector('.proposal-modal')) {
        const modal = document.createElement('div');
        modal.className = 'proposal-modal';
        modal.innerHTML = `
            <div class="proposal-modal-content">
                <div class="modal-header">
                    <h2>Create New Proposal</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="create-proposal-form">
                        <div class="form-group">
                            <label for="proposal-title">Proposal Title</label>
                            <input type="text" id="proposal-title" name="title" placeholder="Enter proposal title" required>
                        </div>
                        <div class="form-group">
                            <label for="proposal-client">Client</label>
                            <select id="proposal-client" name="client" required>
                                <option value="">Select a client</option>
                                <option value="1">ABC Company</option>
                                <option value="2">XYZ Inc.</option>
                                <option value="3">Smith & Co.</option>
                                <option value="new">+ Add New Client</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="proposal-template">Template</label>
                            <select id="proposal-template" name="template" required>
                                <option value="">Select a template</option>
                                <option value="1">Basic Proposal</option>
                                <option value="2">Detailed Project Proposal</option>
                                <option value="3">Marketing Campaign Proposal</option>
                                <option value="4">Web Design Proposal</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="proposal-due-date">Due Date</label>
                            <input type="date" id="proposal-due-date" name="due-date">
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary modal-close-btn">Cancel</button>
                            <button type="submit" class="btn btn-primary">Create Proposal</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        const closeBtn = modal.querySelector('.modal-close');
        const closeBtnSecondary = modal.querySelector('.modal-close-btn');
        const form = modal.querySelector('#create-proposal-form');
        
        closeBtn.addEventListener('click', function() {
            modal.classList.remove('active');
        });
        
        closeBtnSecondary.addEventListener('click', function() {
            modal.classList.remove('active');
        });
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const title = document.getElementById('proposal-title').value;
            const client = document.getElementById('proposal-client').value;
            const template = document.getElementById('proposal-template').value;
            const dueDate = document.getElementById('proposal-due-date').value;
            
            // Simulate form submission
            simulateProposalCreation(title, client, template, dueDate);
            
            // Close modal
            modal.classList.remove('active');
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
    
    // Show modal
    const modal = document.querySelector('.proposal-modal');
    modal.classList.add('active');
}

// Simulate proposal creation
function simulateProposalCreation(title, client, template, dueDate) {
    // Show loading notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Creating proposal...</p>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Simulate API call with timeout
    setTimeout(function() {
        // Update notification
        notification.innerHTML = `
            <div class="notification-content success">
                <i class="fas fa-check-circle"></i>
                <p>Proposal created successfully!</p>
            </div>
        `;
        
        // Add new proposal to list
        const proposalList = document.querySelector('.proposal-list');
        if (proposalList) {
            const newProposal = document.createElement('div');
            newProposal.className = 'proposal-item';
            newProposal.innerHTML = `
                <div class="proposal-info">
                    <div class="proposal-title">${title}</div>
                    <div class="proposal-date">Created: ${new Date().toLocaleDateString()}</div>
                </div>
                <div class="proposal-status status-draft">Draft</div>
                <div class="proposal-actions">
                    <a href="#" class="btn-icon"><i class="fas fa-eye"></i></a>
                    <a href="#" class="btn-icon"><i class="fas fa-edit"></i></a>
                    <a href="#" class="btn-icon"><i class="fas fa-trash"></i></a>
                </div>
            `;
            
            proposalList.prepend(newProposal);
            
            // Update stats
            const totalStat = document.querySelector('.stat-totalProposals');
            if (totalStat) {
                totalStat.textContent = parseInt(totalStat.textContent) + 1;
            }
        }
        
        // Remove notification after delay
        setTimeout(function() {
            notification.remove();
        }, 3000);
    }, 1500);
}
