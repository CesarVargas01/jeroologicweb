// Navigation functionality
class NavigationManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupMobileMenu();
    this.setupSmoothScrolling();
    this.setupHeaderScrollEffect();
  }

  setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const navLinks = document.querySelectorAll('[data-is-nav-link]');
    
    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', String(!isExpanded));
        
        // Toggle menu visibility
        mobileMenu.classList.toggle('-translate-y-full');
        mobileMenu.classList.toggle('translate-y-0');

        // Animate hamburger icon
        const spans = menuToggle.querySelectorAll('span');
        spans[0].classList.toggle('rotate-45');
        spans[0].classList.toggle('translate-y-2');
        spans[1].classList.toggle('opacity-0');
        spans[2].classList.toggle('-rotate-45');
        spans[2].classList.toggle('-translate-y-2');
        
        // Toggle body scroll
        document.body.classList.toggle('overflow-hidden');
      });
    }
    
    // Close menu when a link is clicked
    if (navLinks.length > 0 && mobileMenu) {
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          if (mobileMenu.classList.contains('translate-y-0')) {
            menuToggle?.click();
          }
        });
      });
    }
  }

  setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        // Close mobile menu if open
        const mobileMenu = document.getElementById('mobileMenu');
        const menuToggle = document.getElementById('menuToggle');
        
        if (mobileMenu && mobileMenu.classList.contains('translate-y-0')) {
          menuToggle?.click();
        }
        
        const targetElement = document.querySelector(this.getAttribute('href'));
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth'
          });
        }
      });
    });
  }

  setupHeaderScrollEffect() {
    window.addEventListener('scroll', function() {
      const header = document.querySelector('header');
      if (header) {
        if (window.scrollY > 100) {
          header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
          header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }
      }
    });
  }
}

// Initialize when DOM is loaded
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    new NavigationManager();
  });
}