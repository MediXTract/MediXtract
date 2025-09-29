// Variables globales
let isMobileMenuOpen = false;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupNavigation();
    createParticles();
    setupScrollEffects();
    setupSmoothScrolling();
    setupAccordions();
    setupLightbox();
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
 * Toggle roadmap details expansion
 */
function toggleRoadmapDetails(button) {
    const roadmapContent = button.closest('.roadmap-content');
    const toggleText = button.querySelector('.toggle-text');
    const isExpanded = roadmapContent.classList.contains('expanded');
    
    if (isExpanded) {
        // Collapse
        roadmapContent.classList.remove('expanded');
        toggleText.textContent = 'Read More';
    } else {
        // Expand
        roadmapContent.classList.add('expanded');
        toggleText.textContent = 'Read';
        
        // Smooth scroll to keep the content in view
        setTimeout(() => {
            const rect = roadmapContent.getBoundingClientRect();
            const isInViewport = rect.top >= 0 && rect.bottom <= window.innerHeight;
            
            if (!isInViewport) {
                roadmapContent.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest' 
                });
            }
        }, 100);
    }
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
 * Setup lightbox functionality with zoom support for interface images
 */
function setupLightbox() {
    const lightboxImages = document.querySelectorAll('[data-lightbox]');
    const lightboxOverlay = document.getElementById('lightboxOverlay');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxImageContainer = document.getElementById('lightboxImageContainer');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const zoomResetBtn = document.getElementById('zoomReset');
    
    let currentZoom = 1;
    let panX = 0;
    let panY = 0;
    let isDragging = false;
    let lastX, lastY;
    
    console.log('Setting up lightbox with zoom...', {
        images: lightboxImages.length,
        overlay: !!lightboxOverlay
    });
    
    if (!lightboxOverlay || !lightboxImage || !lightboxCaption || !lightboxClose) {
        console.error('Lightbox elements missing');
        return;
    }
    
    // Add click handlers to all lightbox images
    lightboxImages.forEach((img, index) => {
        img.addEventListener('click', function(e) {
            console.log('Image clicked:', index);
            e.preventDefault();
            
            // Reset zoom and pan
            currentZoom = 1;
            panX = 0;
            panY = 0;
            updateImageTransform();
            
            // Set image and caption
            lightboxImage.src = this.src;
            lightboxImage.alt = this.alt;
            lightboxCaption.textContent = this.alt;
            
            // Show lightbox
            lightboxOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            console.log('Lightbox opened with zoom support');
        });
    });
    
    // Zoom controls
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            zoomIn();
        });
    }
    
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            zoomOut();
        });
    }
    
    if (zoomResetBtn) {
        zoomResetBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            resetZoom();
        });
    }
    
    // Mouse wheel zoom with cursor-centered zooming
    if (lightboxImageContainer) {
        lightboxImageContainer.addEventListener('wheel', function(e) {
            e.preventDefault();
            
            const rect = lightboxImageContainer.getBoundingClientRect();
            const centerX = e.clientX - rect.left;
            const centerY = e.clientY - rect.top;
            
            if (e.deltaY < 0) {
                zoomInAtPoint(centerX, centerY);
            } else {
                zoomOutAtPoint(centerX, centerY);
            }
        });
        
        // Mouse drag for panning
        lightboxImageContainer.addEventListener('mousedown', function(e) {
            if (currentZoom > 1) {
                isDragging = true;
                lastX = e.clientX;
                lastY = e.clientY;
                lightboxImageContainer.classList.add('dragging');
                e.preventDefault();
            }
        });
        
        document.addEventListener('mousemove', function(e) {
            if (isDragging && currentZoom > 1) {
                const deltaX = e.clientX - lastX;
                const deltaY = e.clientY - lastY;
                
                panX += deltaX;
                panY += deltaY;
                
                updateImageTransform();
                
                lastX = e.clientX;
                lastY = e.clientY;
            }
        });
        
        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                lightboxImageContainer.classList.remove('dragging');
            }
        });
        
        // Touch events for mobile
        let initialDistance = 0;
        let initialZoom = 1;
        let touches = {};
        let pinchCenter = { x: 0, y: 0 };
        
        // Double-tap zoom functionality for mobile
        let lastTap = 0;
        
        lightboxImageContainer.addEventListener('touchend', function(e) {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            // Check if this is a double tap (less than 300ms between taps)
            if (tapLength < 300 && tapLength > 0 && e.touches.length === 0) {
                // Double tap detected
                e.preventDefault();
                
                if (currentZoom === 1) {
                    // Zoom in to 2.5x centered
                    const rect = lightboxImageContainer.getBoundingClientRect();
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    zoomToPointWithValue(centerX, centerY, 2.5);
                } else {
                    // Zoom out to original size (centered)
                    resetZoom();
                }
                
                lastTap = 0; // Reset to prevent triple-tap issues
            } else {
                // Single tap - set up for potential double tap
                lastTap = currentTime;
            }
        });
        
        lightboxImageContainer.addEventListener('touchstart', function(e) {
            if (e.touches.length === 2) {
                // Pinch zoom start
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                initialDistance = Math.sqrt(
                    Math.pow(touch2.clientX - touch1.clientX, 2) +
                    Math.pow(touch2.clientY - touch1.clientY, 2)
                );
                initialZoom = currentZoom;
                
                // Calculate pinch center relative to container
                const rect = lightboxImageContainer.getBoundingClientRect();
                pinchCenter.x = ((touch1.clientX + touch2.clientX) / 2) - rect.left;
                pinchCenter.y = ((touch1.clientY + touch2.clientY) / 2) - rect.top;
                
                e.preventDefault();
            } else if (e.touches.length === 1 && currentZoom > 1) {
                // Pan start
                touches.startX = e.touches[0].clientX;
                touches.startY = e.touches[0].clientY;
                touches.panStartX = panX;
                touches.panStartY = panY;
                e.preventDefault();
            }
        });
        
        lightboxImageContainer.addEventListener('touchmove', function(e) {
            if (e.touches.length === 2) {
                // Pinch zoom
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDistance = Math.sqrt(
                    Math.pow(touch2.clientX - touch1.clientX, 2) +
                    Math.pow(touch2.clientY - touch1.clientY, 2)
                );
                
                if (initialDistance > 0) {
                    const scale = currentDistance / initialDistance;
                    const newZoom = Math.max(1, Math.min(5, initialZoom * scale));
                    
                    if (newZoom !== currentZoom) {
                        zoomToPointWithValue(pinchCenter.x, pinchCenter.y, newZoom);
                    }
                }
                e.preventDefault();
            } else if (e.touches.length === 1 && currentZoom > 1 && touches.startX !== undefined) {
                // Pan
                const deltaX = e.touches[0].clientX - touches.startX;
                const deltaY = e.touches[0].clientY - touches.startY;
                
                panX = touches.panStartX + deltaX;
                panY = touches.panStartY + deltaY;
                
                updateImageTransform();
                e.preventDefault();
            }
        });
        
        lightboxImageContainer.addEventListener('touchend', function(e) {
            if (e.touches.length === 0) {
                initialDistance = 0;
                touches = {};
            }
        });
    }
    
    // Close button
    lightboxClose.addEventListener('click', function(e) {
        console.log('Close button clicked');
        e.preventDefault();
        e.stopPropagation();
        closeLightbox();
    });
    
    // Click outside to close
    lightboxOverlay.addEventListener('click', function(e) {
        if (e.target === lightboxOverlay) {
            console.log('Clicked outside image');
            closeLightbox();
        }
    });
    
    // Escape key to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightboxOverlay.classList.contains('active')) {
            console.log('Escape pressed');
            closeLightbox();
        }
    });
    
    function zoomIn() {
        const rect = lightboxImageContainer.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        zoomInAtPoint(centerX, centerY);
    }
    
    function zoomOut() {
        const rect = lightboxImageContainer.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        zoomOutAtPoint(centerX, centerY);
    }
    
    function zoomInAtPoint(pointX, pointY) {
        const newZoom = Math.min(currentZoom * 1.3, 5);
        zoomToPointWithValue(pointX, pointY, newZoom);
    }
    
    function zoomOutAtPoint(pointX, pointY) {
        const newZoom = Math.max(currentZoom / 1.3, 1); // Minimum zoom is 1 (100%)
        
        if (newZoom <= 1) {
            // Force perfect centering when at minimum zoom
            currentZoom = 1;
            panX = 0;
            panY = 0;
            updateImageTransform();
        } else {
            zoomToPointWithValue(pointX, pointY, newZoom);
        }
    }
    
    function zoomToPointWithValue(pointX, pointY, newZoom) {
        if (newZoom === currentZoom) return;
        
        // Calculate the point in image coordinates before zoom
        const rect = lightboxImageContainer.getBoundingClientRect();
        const containerCenterX = rect.width / 2;
        const containerCenterY = rect.height / 2;
        
        // Point relative to current image center
        const relativeX = (pointX - containerCenterX - panX) / currentZoom;
        const relativeY = (pointY - containerCenterY - panY) / currentZoom;
        
        // Update zoom
        currentZoom = newZoom;
        
        // Calculate new pan to keep the same point under the cursor/finger
        panX = pointX - containerCenterX - (relativeX * currentZoom);
        panY = pointY - containerCenterY - (relativeY * currentZoom);
        
        updateImageTransform();
    }
    
    function resetZoom() {
        currentZoom = 1;
        panX = 0;
        panY = 0;
        updateImageTransform();
    }
    
    function updateImageTransform() {
        if (lightboxImage) {
            lightboxImage.style.transform = `scale(${currentZoom}) translate(${panX / currentZoom}px, ${panY / currentZoom}px)`;
        }
    }
    
    function closeLightbox() {
        console.log('Closing lightbox');
        lightboxOverlay.classList.remove('active');
        document.body.style.overflow = '';
        lightboxImage.src = '';
        lightboxCaption.textContent = '';
        
        // Reset zoom and pan
        currentZoom = 1;
        panX = 0;
        panY = 0;
        updateImageTransform();
    }
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
window.toggleRoadmapDetails = toggleRoadmapDetails;
