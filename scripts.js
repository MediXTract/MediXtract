// Variables globales
let currentLang = 'en';
let isMobileMenuOpen = false;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupNavigation();
    createParticles();
    setupScrollEffects();
    initializeLanguage();
    setupSmoothScrolling();
});

/**
 * Setup navigation functionality - CORREGIDO
 */
function setupNavigation() {
    // NO agregar event listener aquí porque usamos onclick inline
    
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
 * Toggle mobile menu - SIMPLIFICADO Y CORREGIDO
 */
function toggleMobileMenu() {
    console.log('toggleMobileMenu called'); // Para debug
    
    const mobileNav = document.getElementById('mobileNav');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    console.log('mobileNav:', mobileNav); // Para debug
    console.log('mobileToggle:', mobileToggle); // Para debug
    
    if (!mobileNav || !mobileToggle) {
        console.error('No se encontraron los elementos del menú móvil');
        return;
    }
    
    isMobileMenuOpen = !isMobileMenuOpen;
    console.log('isMobileMenuOpen:', isMobileMenuOpen); // Para debug
    
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
 * Close mobile menu - SIMPLIFICADO
 */
function closeMobileMenu() {
    console.log('closeMobileMenu called'); // Para debug
    
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
 * Switch language
 */
function switchLanguage(lang) {
    if (lang !== 'en' && lang !== 'de') return;
    
    currentLang = lang;
    
    // Update content visibility
    document.querySelectorAll('.language-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const contentElement = document.getElementById(lang + '-content');
    if (contentElement) {
        contentElement.classList.add('active');
    }
    
    // Update language buttons
    document.querySelectorAll('.navbar-lang-btn').forEach(btn => {
        btn.classList.remove('active');
        const btnText = btn.textContent.trim();
        if ((lang === 'en' && btnText.includes('EN')) || 
            (lang === 'de' && btnText.includes('DE'))) {
            btn.classList.add('active');
        }
    });
    
    // Update translatable elements
    document.querySelectorAll(`[data-${lang}]`).forEach(element => {
        const translatedText = element.getAttribute(`data-${lang}`);
        if (translatedText) {
            element.textContent = translatedText;
        }
    });
    
    // Update document language
    document.documentElement.lang = lang;
    
    // Close mobile menu and store preference
    if (isMobileMenuOpen) setTimeout(closeMobileMenu, 100);
    
    try {
        sessionStorage.setItem('medixtrack-lang', lang);
    } catch (e) {
        console.log('Could not store language preference');
    }
}

/**
 * Initialize language from storage or browser
 */
function initializeLanguage() {
    let lang = 'en';
    
    try {
        const storedLang = sessionStorage.getItem('medixtrack-lang');
        if (storedLang && (storedLang === 'en' || storedLang === 'de')) {
            lang = storedLang;
        } else {
            // Fallback to browser language
            const browserLang = navigator.language || navigator.userLanguage || 'en';
            lang = browserLang.toLowerCase().startsWith('de') ? 'de' : 'en';
        }
    } catch (e) {
        console.log('Could not access language storage');
    }
    
    switchLanguage(lang);
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
    const sections = ['vision', 'architecture', 'features', 'roadmap', 'budget', 'tech'];
    const suffix = currentLang === 'de' ? '-de' : '';
    const scrollPosition = window.scrollY + 200;
    
    let currentSection = null;
    
    sections.forEach(section => {
        const element = document.getElementById(section + suffix);
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
            
            // Handle language-specific sections
            let targetElement = document.getElementById(targetId);
            if (currentLang === 'de' && !targetId.endsWith('-de')) {
                targetElement = document.getElementById(targetId + '-de') || targetElement;
            }
            
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

// Handle window resize for particles
window.addEventListener('resize', function() {
    // Simple debounce
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(createParticles, 250);
});

// Expose functions globally for inline handlers
window.scrollToTop = scrollToTop;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.switchLanguage = switchLanguage;
