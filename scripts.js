// Variables globales
let isMobileMenuOpen = false;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupNavigation();
    createParticles();
    setupScrollEffects();
    setupSmoothScrolling();
    setupAccordions();
    setupInterfaceAccordions();
});

/**
 * Setup navigation functionality
 */
function setupNavigation() {
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        const mobileNav = document.getElementById('mobileNav');
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        
        if (mobileNav && mobileToggle && isMobileMenuOpen && 
            !mobileNav.contains(e.target) && !mobileToggle.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isMobileMenuOpen) {
            closeMobileMenu();
        }
    });
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
    console.log('toggleMobileMenu called');
    
    const mobileNav = document.getElementById('mobileNav');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    if (!mobileNav || !mobileToggle) {
        console.error('No se encontraron los elementos del menú móvil');
        return;
    }
    
    isMobileMenuOpen = !isMobileMenuOpen;
    
    if (isMobileMenuOpen) {
        mobileNav.classList.add('active');
        mobileToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        mobileNav.classList.remove('active');
        mobileToggle.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
    console.log('closeMobileMenu called');
    
    const mobileNav = document.getElementById('mobileNav');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    if (!mobileNav || !mobileToggle) return;
    
    isMobileMenuOpen = false;
    mobileNav.classList.remove('active');
    mobileToggle.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Scroll to top
 */
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (isMobileMenuOpen) closeMobileMenu();
}

/**
 * Create simple animated particles
 */
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    particlesContainer.innerHTML = '';
    const numberOfParticles = window.innerWidth <= 768 ? 15 : 25;
    
    for (let i = 0; i < numberOfParticles; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random positioning and animation
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 5 + 's';
        particle.style.animationDuration = (Math.random() * 20 + 15) + 's';
        
        particlesContainer.appendChild(particle);
    }
}

/**
 * Setup scroll effects
 */
function setupScrollEffects() {
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        const scrollY = window.scrollY;
        
        // Navbar scroll effect
        if (scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Highlight active section
        highlightActiveSection();
    }, { passive: true });
}

/**
 * Highlight active navigation section
 */
function highlightActiveSection() {
    const sections = ['vision', 'features', 'roadmap', 'budget', 'interface', 'advantages'];
    const scrollPosition = window.scrollY + 200;
    
    let currentSection = null;
    
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            const rect = element.getBoundingClientRect();
            const sectionTop = rect.top + window.scrollY;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + rect.height) {
                currentSection = section;
            }
        }
    });
    
    // Update navigation
    if (currentSection) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelectorAll(`.nav-link[href="#${currentSection}"]`).forEach(link => {
            link.classList.add('active');
        });
    }
}

/**
 * Setup smooth scrolling
 */
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            if (targetId === '') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerOffset = 100;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (isMobileMenuOpen) {
                    setTimeout(closeMobileMenu, 300);
                }
            }
        });
    });
}

/**
 * Setup accordion functionality for mobile advantages
 */
function setupAccordions() {
    // Only enable accordions on mobile (screen width <= 768px)
    if (window.innerWidth > 768) return;
    
    const accordionItems = document.querySelectorAll('[data-accordion]');
    
    accordionItems.forEach(item => {
        const header = item.querySelector('.checkmark-header');
        
        if (header) {
            header.addEventListener('click', function() {
                // Toggle expanded state
                const isExpanded = item.classList.contains('expanded');
                
                // Close all other accordions
                accordionItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('expanded');
                    }
                });
                
                // Toggle current accordion
                item.classList.toggle('expanded', !isExpanded);
            });
        }
    });
}

/**
 * Setup interface accordion functionality
 */
function setupInterfaceAccordions() {
    const interfaceItems = document.querySelectorAll('[data-interface-accordion]');
    
    interfaceItems.forEach(item => {
        item.addEventListener('click', function() {
            // Toggle expanded state
            const isExpanded = item.classList.contains('expanded');
            
            // Close all other interface accordions
            interfaceItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('expanded');
                }
            });
            
            // Toggle current interface accordion
            item.classList.toggle('expanded', !isExpanded);
        });
    });
}

/**
 * Setup accordion functionality for mobile advantages
 */
function setupAccordions() {
    // Only enable accordions on mobile (screen width <= 768px)
    if (window.innerWidth > 768) return;
    
    const accordionItems = document.querySelectorAll('[data-accordion]');
    
    accordionItems.forEach(item => {
        const header = item.querySelector('.checkmark-header');
        
        if (header) {
            header.addEventListener('click', function() {
                // Toggle expanded state
                const isExpanded = item.classList.contains('expanded');
                
                // Close all other accordions
                accordionItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('expanded');
                    }
                });
                
                // Toggle current accordion
                item.classList.toggle('expanded', !isExpanded);
            });
        }
    });
}

/**
 * Setup interface accordion functionality
 */
function setupInterfaceAccordions() {
    const interfaceItems = document.querySelectorAll('[data-interface-accordion]');
    
    interfaceItems.forEach(item => {
        item.addEventListener('click', function() {
            // Toggle expanded state
            const isExpanded = item.classList.contains('expanded');
            
            // Close all other interface accordions
            interfaceItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('expanded');
                }
            });
            
            // Toggle current interface accordion
            item.classList.toggle('expanded', !isExpanded);
        });
    });
}

// Handle window resize to enable/disable accordions
window.addEventListener('resize', function() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
        // Reset accordions when switching between mobile and desktop
        const accordionItems = document.querySelectorAll('[data-accordion]');
        accordionItems.forEach(item => {
            if (window.innerWidth > 768) {
                // Desktop: remove accordion classes
                item.classList.remove('expanded');
            }
        });
        
        // Re-setup accordions if needed
        setupAccordions();
        createParticles();
    }, 250);
});

// Expose functions globally for inline handlers
window.scrollToTop = scrollToTop;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
