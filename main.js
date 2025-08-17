document.addEventListener('DOMContentLoaded', () => {
        // Mobile menu functionality
        const menuToggle = document.getElementById('menuToggle');
        const mobileMenu = document.getElementById('mobileMenu');
        const closeMenu = document.getElementById('closeMenu');
        const mobileLinks = document.querySelectorAll('.mobile-link');
        
        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', () => {
                mobileMenu.classList.add('active');
                document.body.style.overflow = 'hidden';
                menuToggle.setAttribute('aria-expanded', 'true');
            });
        }
        
        if (closeMenu && mobileMenu) {
            closeMenu.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        }
        
        if(mobileLinks.length > 0 && mobileMenu) {
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.remove('active');
                    document.body.style.overflow = 'auto';
                    if (menuToggle) {
                        menuToggle.setAttribute('aria-expanded', 'false');
                    }
                });
            });
        }
        
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                
                if (mobileMenu && menuToggle) {
                    // Close mobile menu if open
                    mobileMenu.classList.remove('active');
                    document.body.style.overflow = 'auto';
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
                
                const targetElement = document.querySelector(this.getAttribute('href'));
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // Form submission handling
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Get form values
                const nameInput = document.getElementById('name');
                const emailInput = document.getElementById('email');
                const name = nameInput ? nameInput.value : '';
                const email = emailInput ? emailInput.value : '';
                
                // Simple validation
                if (name && email) {
                    alert(`¡Gracias ${name}! Hemos recibido tu mensaje y nos pondremos en contacto contigo pronto.`);
                    contactForm.reset();
                } else {
                    alert('Por favor completa los campos requeridos.');
                }
            });
        }
        
        // Header scroll effect
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

        // Scroll to top button functionality
        const scrollToTopBtn = document.getElementById('scrollToTopBtn');

        if (scrollToTopBtn) {
            // Apply styles directly via JavaScript
            Object.assign(scrollToTopBtn.style, {
                position: 'fixed',
                bottom: '110px',
                right: '30px',
                width: '50px',
                height: '50px',
                backgroundColor: '#223e7c', // var(--primary)
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                zIndex: '1001',
                cursor: 'pointer',
                border: 'none',
                transition: 'opacity 0.3s, transform 0.3s',
                opacity: '0',
                transform: 'translateY(10px)',
                pointerEvents: 'none'
            });

            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    scrollToTopBtn.style.opacity = '1';
                    scrollToTopBtn.style.transform = 'translateY(0)';
                    scrollToTopBtn.style.pointerEvents = 'auto';
                } else {
                    scrollToTopBtn.style.opacity = '0';
                    scrollToTopBtn.style.transform = 'translateY(10px)';
                    scrollToTopBtn.style.pointerEvents = 'none';
                }
            });

            scrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
});
