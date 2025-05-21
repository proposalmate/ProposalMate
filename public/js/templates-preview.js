// Templates preview and interaction functionality
document.addEventListener('DOMContentLoaded', function() {
  // Get modal elements
  const modal = document.getElementById('template-preview-modal');
  const closeModal = document.querySelector('.close-modal');
  const previewTitle = document.getElementById('preview-title');
  const previewContent = document.getElementById('preview-content');
  const useTemplateBtn = document.getElementById('use-template-btn');
  
  // Template category filtering
  const categoryButtons = document.querySelectorAll('.template-category');
  const templateCards = document.querySelectorAll('.template-card');
  
  // Add event listeners to category buttons
  categoryButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      categoryButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      const category = this.getAttribute('data-category');
      
      // Show/hide templates based on category
      templateCards.forEach(card => {
        if (category === 'all' || card.id === category) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
  
  // Preview template functionality
  const previewButtons = document.querySelectorAll('.template-preview');
  
  previewButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      const templateType = this.getAttribute('data-template');
      const template = window.WeddingTemplates[templateType];
      
      if (!template) {
        console.error('Template not found:', templateType);
        return;
      }
      
      // Set modal title
      previewTitle.textContent = template.name + ' Template';
      
      // Generate preview content
      let previewHTML = `
        <div class="template-preview-header">
          <h1>${template.name} Proposal</h1>
          <p class="template-description">${template.description}</p>
        </div>
      `;
      
      // Add sections
      template.sections.forEach(section => {
        previewHTML += `<div class="template-section">
          <h2>${section.title}</h2>`;
          
        if (typeof section.content === 'string') {
          // Simple text content
          previewHTML += `<p>${section.content.replace(/\n/g, '<br>')}</p>`;
        } else if (Array.isArray(section.content)) {
          // Complex content (packages, menus, etc.)
          if (section.content[0].name && section.content[0].price) {
            // Packages or pricing
            previewHTML += `<div class="packages-grid">`;
            section.content.forEach(package => {
              previewHTML += `
                <div class="package-card">
                  <h3>${package.name}</h3>
                  <div class="package-price">${package.price}</div>
                  <ul class="package-features">`;
              
              if (package.features) {
                package.features.forEach(feature => {
                  previewHTML += `<li>${feature}</li>`;
                });
              } else if (package.items) {
                package.items.forEach(item => {
                  previewHTML += `<li>${item}</li>`;
                });
              }
              
              previewHTML += `</ul>
                </div>`;
            });
            previewHTML += `</div>`;
          } else if (section.content[0].name && section.content[0].description) {
            // Service styles or spaces
            previewHTML += `<div class="services-list">`;
            section.content.forEach(service => {
              previewHTML += `
                <div class="service-item">
                  <h3>${service.name}</h3>`;
              
              if (service.capacity) {
                previewHTML += `<p class="service-capacity">${service.capacity}</p>`;
              }
              
              previewHTML += `<p>${service.description}</p>
                </div>`;
            });
            previewHTML += `</div>`;
          }
        }
        
        previewHTML += `</div>`;
      });
      
      // Set preview content
      previewContent.innerHTML = previewHTML;
      
      // Set use template button link
      useTemplateBtn.href = `create.html?template=${templateType}`;
      
      // Show modal
      modal.style.display = 'block';
    });
  });
  
  // Close modal functionality
  closeModal.addEventListener('click', function() {
    modal.style.display = 'none';
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
});
