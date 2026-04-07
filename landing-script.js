// get started
function goToApp() {
  window.location.href = "index.html";
}

// =====================================================
// TaskFlow Landing Page JavaScript
// =====================================================

// ===== Authentication Overlay Logic =====
document.addEventListener('DOMContentLoaded', function() {
  const overlay = document.getElementById('welcomeOverlay');
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('errorMessage');
  
  // Demo credentials
  const VALID_CREDENTIALS = {
    username: 'demo',
    pin: '1234'
  };
  
  // Handle form submission
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const pin = document.getElementById('pin').value.trim();
    
    // Validate credentials
    if (username === VALID_CREDENTIALS.username && pin === VALID_CREDENTIALS.pin) {
      // Success - hide overlay with animation
      errorMessage.style.display = 'none';
      overlay.classList.add('hidden');
      
      // Store authentication status
      sessionStorage.setItem('taskflow_authenticated', 'true');
      
      // Optional: Show success message
      setTimeout(() => {
        showToast('Welcome to TaskFlow!', 'success');
      }, 300);
    } else {
      // Error - show error message
      errorMessage.textContent = 'Invalid username or PIN. Please try again.';
      errorMessage.style.display = 'block';
      
      // Shake animation
      loginForm.style.animation = 'shake 0.5s';
      setTimeout(() => {
        loginForm.style.animation = '';
      }, 500);
    }
  });
  
  // Check if already authenticated
  if (sessionStorage.getItem('taskflow_authenticated') === 'true') {
    overlay.classList.add('hidden');
  }
});

// Shake animation CSS (injected dynamically)
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
    20%, 40%, 60%, 80% { transform: translateX(10px); }
  }
`;
document.head.appendChild(style);

// ===== FAQ Accordion Logic =====
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');
  
  question.addEventListener('click', () => {
    const isActive = item.classList.contains('active');
    
    // Close all other items
    faqItems.forEach(otherItem => {
      if (otherItem !== item) {
        otherItem.classList.remove('active');
      }
    });
    
    // Toggle current item
    if (isActive) {
      item.classList.remove('active');
    } else {
      item.classList.add('active');
    }
  });
});

// ===== Smooth Scroll for Navigation Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    
    if (target) {
      const headerOffset = 100;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ===== Navbar Scroll Effect =====
let lastScroll = 0;
const navbar = document.querySelector('.nav-header');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll <= 0) {
    navbar.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
  } else {
    navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
  }
  
  lastScroll = currentScroll;
});

// ===== CTA Button Click Handlers =====
const ctaButtons = document.querySelectorAll('.btn-primary, .btn-secondary');

ctaButtons.forEach(button => {
  button.addEventListener('click', function(e) {
    const buttonText = this.textContent.trim();
    
    // Handle different CTA actions
    // if (buttonText.includes('Get Started') || buttonText.includes('Start Free Trial')) {
    //   e.preventDefault();
    //   showToast('Sign-up feature coming soon! 🚀', 'info');
    // } else if (buttonText.includes('Watch Demo')) {
    //   e.preventDefault();
    //   showToast('Demo video feature coming soon! 🎥', 'info');
    // } else if (buttonText.includes('Contact Sales')) {
    //   e.preventDefault();
    //   showToast('Sales contact feature coming soon! 💼', 'info');
    // }
  });
});

// ===== Simple Toast Notification System =====
function showToast(message, type = 'info') {
  // Remove existing toast if any
  const existingToast = document.querySelector('.toast-notification');
  if (existingToast) {
    existingToast.remove();
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.textContent = message;
  
  // Toast styles
  const toastStyles = {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    background: type === 'success' ? '#8FEC78' : type === 'error' ? '#ff5252' : '#3b82f6',
    color: 'white',
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    fontSize: '0.9375rem',
    fontWeight: '500',
    zIndex: '10000',
    animation: 'slideIn 0.3s ease',
    maxWidth: '90%',
    width: 'auto'
  };
  
  Object.assign(toast.style, toastStyles);
  
  // Add toast to body
  document.body.appendChild(toast);
  
  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Toast animations
const toastAnimationStyle = document.createElement('style');
toastAnimationStyle.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
  
  @media (max-width: 768px) {
    .toast-notification {
      bottom: 1rem !important;
      right: 1rem !important;
      left: 1rem !important;
      width: auto !important;
    }
  }
`;
document.head.appendChild(toastAnimationStyle);

// ===== Intersection Observer for Fade-in Animations =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe elements for animation
const animateElements = document.querySelectorAll('.feature-card, .step-item, .testimonial-card, .pricing-card');

animateElements.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// ===== Mobile Menu Toggle (for responsive navigation) =====
// Add hamburger menu functionality for mobile
if (window.innerWidth <= 768) {
  const navLinks = document.querySelector('.nav-links');
  const navContainer = document.querySelector('.nav-container');
  
  // Create hamburger button
  const hamburger = document.createElement('button');
  hamburger.className = 'hamburger-menu';
  hamburger.innerHTML = '☰';
  hamburger.style.cssText = `
    display: block;
    background: transparent;
    border: none;
    font-size: 1.5rem;
    color: var(--text-primary);
    cursor: pointer;
    padding: 0.5rem;
  `;
  
  // Insert hamburger before nav links
  navContainer.insertBefore(hamburger, navLinks);
  
  // Toggle menu
  hamburger.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
  });
}

// ===== Log Page Load =====
console.log('🎯 TaskFlow Landing Page Loaded Successfully!');
console.log('📝 Demo Credentials: username: demo | pin: 1234');