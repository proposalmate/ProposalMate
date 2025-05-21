// Email validation helper
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

// Show error message
function showError(input, message) {
  const parent = input.parentElement;
  const existingError = parent.querySelector('.error-message');
  if (existingError) parent.removeChild(existingError);

  input.classList.add('error');

  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  parent.appendChild(errorDiv);

  input.focus();
}

// Registration handling
document.addEventListener('DOMContentLoaded', function () {
  const signupForm = document.getElementById('signup-form');

  if (signupForm) {
    signupForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const name = document.getElementById('name');
      const email = document.getElementById('email');
      const password = document.getElementById('password');
      const confirmPassword = document.getElementById('confirm-password');
      const terms = document.getElementById('terms');

      // Validate name
      if (!name.value.trim()) {
        showError(name, 'Name is required');
        return;
      }

      // Validate email
      if (!validateEmail(email.value)) {
        showError(email, 'Please enter a valid email address');
        return;
      }

      // Validate password
      if (password.value.length < 8) {
        showError(password, 'Password must be at least 8 characters long');
        return;
      }

      // Validate password confirmation
      if (password.value !== confirmPassword.value) {
        showError(confirmPassword, 'Passwords do not match');
        return;
      }

      // Validate terms
      if (!terms.checked) {
        showError(terms, 'You must agree to the Terms of Service and Privacy Policy');
        return;
      }

      try {
        const res = await fetch('/api/v1/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name.value,
            email: email.value,
            password: password.value
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Registration failed');
        }

        // Save token in localStorage
        localStorage.setItem('token', data.token);
        
        // Show success message and redirect
        signupForm.innerHTML = `
          <div class="success-message">
            <i class="fas fa-check-circle"></i>
            <h3>Registration Successful!</h3>
            <p>Your account has been created. You will be redirected to the dashboard in a moment.</p>
          </div>
        `;
        
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 2000);
        
      } catch (err) {
        alert(err.message || 'An error occurred during registration');
      }
    });
  }
});
