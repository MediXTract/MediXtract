/**
 * Particle System
 * Creates the "submerged" aqueous feeling with floating particles and zebrafish.
 */

function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    
    const particleCount = 20; // Reduced density
    
    // Dynamically determine the assets path based on the current location
    const bodyPath = window.location.pathname;
    const isSubPage = bodyPath.includes('/pages/');
    const assetsPrefix = isSubPage ? '../' : '';
    const fishAsset = `${assetsPrefix}assets/images/illustrations/objects/zebra_fish-white.png`;
    
    const isMobile = window.innerWidth <= 768;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        const isFish = Math.random() < 0.2; // 20% chance to be a fish
        
        particle.className = isFish ? 'particle fish' : 'particle';
        
        // Randomize size, position, and duration
        let size;
        if (isFish) {
            // Increased fish size for mobile prominence
            const baseSize = isMobile ? 32 : 30;
            const variation = isMobile ? 28 : 30;
            size = Math.random() * variation + baseSize; 
            
            particle.style.backgroundImage = `url("${fishAsset}")`;
            particle.style.backgroundSize = 'contain';
            particle.style.backgroundRepeat = 'no-repeat';
            particle.style.backgroundPosition = 'center';
            particle.style.borderRadius = '0';
            particle.style.backgroundColor = 'transparent'; 
        } else {
            size = Math.random() * 8 + 4;
            particle.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            particle.style.borderRadius = '50%';
        }
        
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const duration = Math.random() * 15 + 15; // Slightly faster for debugging
        const delay = Math.random() * -30; 
        
        particle.style.width = isFish ? `${size * 2}px` : `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.position = 'absolute';
        particle.style.pointerEvents = 'none';
        particle.style.opacity = isFish ? '0.45' : '0.15'; // Polished visibility levels
        particle.style.willChange = 'transform, opacity'; // Hint for hardware acceleration
        
        // Use CSS Animation
        const animationName = isFish ? 'swim' : 'float';
        particle.style.animation = `${animationName} ${duration}s ease-in-out ${delay}s infinite`;
        
        container.appendChild(particle);
    }
}

// Add animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.1; }
        33% { transform: translate(50px, -80px) rotate(120deg); opacity: 0.3; }
        66% { transform: translate(-30px, -40px) rotate(240deg); opacity: 0.2; }
    }
    @keyframes swim {
        0% { transform: translate(0, 0) rotate(0deg) scaleX(1); opacity: 0; }
        15% { opacity: 0.5; } /* Fade in more strongly */
        45% { transform: translate(150px, -30px) rotate(10deg) scaleX(1); }
        50% { transform: translate(160px, -30px) rotate(10deg) scaleX(-1); }
        85% { opacity: 0.5; }
        100% { transform: translate(0, 0) rotate(0deg) scaleX(-1); opacity: 0; }
    }
    #particles {
        position: absolute;
        width: 100%;
        height: 100%;
        overflow: hidden;
        z-index: 1;
        pointer-events: none;
    }
    .particle.fish {
        filter: brightness(2) contrast(1.2) drop-shadow(0 0 5px rgba(255, 255, 255, 0.3)); /* Self-illuminated glow */
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', initParticles);
