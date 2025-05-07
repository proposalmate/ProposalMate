// ProposalMate Main JavaScript File

document.addEventListener('DOMContentLoaded', function () { setupMobileMenu(); setupFormValidation(); setupSmoothScrolling(); initializeInteractiveElements(); setupSidebarNavigation(); setupCreateProposalForm(); loadProposalsToDashboard(); });

// Mobile Menu Setup function setupMobileMenu() { const header = document.querySelector('header'); if (!header) return;

if (!document.querySelector('.mobile-menu-toggle')) {
    const nav = header.querySelector('nav');
    if (nav) {
        const mobileToggle = document.createElement('div');
        mobileToggle.className = 'mobile-menu-toggle';
        mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
        nav.appendChild(mobileToggle);

        if (!document.querySelector('.mobile-menu')) {
            const mobileMenu = document.createElement('div');
            mobileMenu.className = 'mobile-menu';

            const closeButton = document.createElement('div');
            closeButton.className = 'mobile-menu-close';
            closeButton.innerHTML = '<i class="fas fa-times"></i>';
            mobileMenu.appendChild(closeButton);

            const menuLinks = document.createElement('div');
            menuLinks.className = 'mobile-menu-links';

            const navLinks = header.querySelectorAll('.nav-links a');
            navLinks.forEach(link => {
                const newLink = link.cloneNode(true);
                menuLinks.appendChild(newLink);
            });

            mobileMenu.appendChild(menuLinks);
            document.body.appendChild(mobileMenu);

            closeButton.addEventListener('click', function () {
                mobileMenu.classList.remove('active');
            });
        }

        const mobileMenu = document.querySelector('.mobile-menu');
        mobileToggle.addEventListener('click', function () {
            mobileMenu.classList.add('active');
        });
    }
}
}

function setupFormValidation() { const signupForm = document.getElementById('signup-form'); if (signupForm) { signupForm.addEventListener('submit', function (e) { e.preventDefault();

        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirm-password');
        const terms = document.getElementById('terms');

        if (!name.value.trim()) {
            showError(name, 'Name is required');
            return;
        }
        if (!validateEmail(email.value)) {
            showError(email, 'Please enter a valid email address');
            return;
        }
        if (password.value.length < 8) {
            showError(password, 'Password must be at least 8 characters long');
            return;
        }
        if (password.value !== confirmPassword.value) {
            showError(confirmPassword, 'Passwords do not match');
            return;
        }
        if (!terms.checked) {
            showError(terms, 'You must accept the Terms of Service and Privacy Policy');
            return;
        }

        simulateSignup(name.value, email.value);
    });
}
}

function validateEmail(email) { const re = /^(([^<>()\.,;:\s@"]+)*)|(".+"))@(([0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/; return re.test(String(email).toLowerCase()); }

function showError(input, message) { const parent = input.parentElement; const existingError = parent.querySelector('.error-message'); if (existingError) { parent.removeChild(existingError); } input.classList.add('error'); const errorDiv = document.createElement('div'); errorDiv.className = 'error-message'; errorDiv.textContent = message; parent.appendChild(errorDiv); input.focus(); }

function simulateSignup(name, email) { const submitButton = document.querySelector('#signup-form button[type="submit"]'); const originalText = submitButton.textContent; submitButton.textContent = 'Processing...'; submitButton.disabled = true;

setTimeout(function () {
    window.location.href = 'dashboard.html';
}, 2000);
}

function setupSmoothScrolling() { document.querySelectorAll('a[href^="#"]').forEach(anchor => { anchor.addEventListener('click', function (e) { e.preventDefault(); const selector = this.getAttribute('href'); if (selector && selector.startsWith('#') && selector !== '#') { const target = document.querySelector(selector); if (target) { target.scrollIntoView({ behavior: 'smooth' }); } } }); }); }

function initializeInteractiveElements() { const featureCards = document.querySelectorAll('.feature-card'); featureCards.forEach(card => { card.addEventListener('mouseenter', function () { this.classList.add('hover'); }); card.addEventListener('mouseleave', function () { this.classList.remove('hover'); }); }); setupDashboardInteractions(); }

function setupDashboardInteractions() { const userMenu = document.getElementById('user-menu'); if (userMenu) { const dropdown = document.createElement('div'); dropdown.className = 'user-dropdown'; dropdown.innerHTML = <ul> <li><a href="#"><i class="fas fa-user"></i> Profile</a></li> <li><a href="#"><i class="fas fa-cog"></i> Settings</a></li> <li><a href="#"><i class="fas fa-credit-card"></i> Subscription</a></li> <li><a href="../index.html"><i class="fas fa-sign-out-alt"></i> Logout</a></li> </ul>; const header = document.querySelector('header'); header.appendChild(dropdown);

    userMenu.addEventListener('click', function (e) {
        e.preventDefault();
        dropdown.classList.toggle('active');
    });
    document.addEventListener('click', function (e) {
        if (!userMenu.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
}

const proposalActions = document.querySelectorAll('.proposal-actions .btn-icon');
proposalActions.forEach(action => {
    action.addEventListener('click', function (e) {
        e.preventDefault();
        const icon = this.querySelector('i');
        const actionType = icon.className.includes('eye') ? 'view' :
            icon.className.includes('edit') ? 'edit' :
                icon.className.includes('trash') ? 'delete' : '';
        const proposalItem = this.closest('.proposal-item');
        const proposalTitle = proposalItem.querySelector('.proposal-title').textContent;

        switch (actionType) {
            case 'view':
                alert(`Viewing proposal: ${proposalTitle}`);
                break;
            case 'edit':
                alert(`Editing proposal: ${proposalTitle}`);
                break;
            case 'delete':
                if (confirm(`Are you sure you want to delete "${proposalTitle}"?`)) {
                    proposalItem.style.opacity = '0';
                    setTimeout(() => {
                        proposalItem.style.height = '0';
                        proposalItem.style.padding = '0';
                        proposalItem.style.margin = '0';
                        proposalItem.style.overflow = 'hidden';
                        setTimeout(() => {
                            proposalItem.remove();
                        }, 300);
                    }, 300);
                }
                break;
        }
    });
});
}

function setupSidebarNavigation() { const sidebarLinks = document.querySelectorAll('.sidebar a'); sidebarLinks.forEach(link => { link.addEventListener('click', function (e) { e.preventDefault(); const target = this.getAttribute('href'); if (target && !target.startsWith('#')) { window.location.href = target; } }); }); }

function setupCreateProposalForm() { const form = document.getElementById('create-proposal-form'); if (!form) return; form.addEventListener('submit', function (e) { e.preventDefault(); const title = document.getElementById('proposal-title').value.trim(); const client = document.getElementById('proposal-client').value.trim(); const template = document.getElementById('proposal-template').value; const dueDate = document.getElementById('proposal-due-date').value;

    if (!title || !client || !template) {
        alert('Please fill in all required fields.');
        return;
    }

    const newProposal = {
        title,
        client,
        template,
        dueDate,
        status: 'draft'
    };

    let proposals = JSON.parse(localStorage.getItem('proposals') || '[]');
    proposals.push(newProposal);
    localStorage.setItem('proposals', JSON.stringify(proposals));
    alert('Proposal created successfully!');
    window.location.href = 'dashboard.html';
});
}

function loadProposalsToDashboard() { const listContainer = document.querySelector('.proposal-list'); if (!listContainer) return; const proposals = JSON.parse(localStorage.getItem('proposals') || '[]'); listContainer.innerHTML = ''; if (proposals.length === 0) { listContainer.innerHTML = '

No proposals found.

'; return; } proposals.forEach(proposal => { const item = document.createElement('div'); item.className = 'proposal-item'; item.innerHTML = <h3 class="proposal-title">${proposal.title}</h3> <p>Client: ${proposal.client}</p> <p>Template: ${proposal.template}</p> <p>Due: ${proposal.dueDate || 'Not set'}</p>; listContainer.appendChild(item); }); document.querySelector('.stat-totalProposals').textContent = proposals.length; document.querySelector('.stat-sentProposals').textContent = 0; document.querySelector('.stat-viewedProposals').textContent = 0; document.querySelector('.stat-acceptedProposals').textContent = 0; } 