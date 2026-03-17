/**
 * Lightbox Logic
 * Handles image zooming and overlay view.
 */

document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('[data-lightbox]');
    const overlay = document.getElementById('lightboxOverlay');
    const lightboxImg = document.getElementById('lightboxImage');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const closeBtn = document.getElementById('lightboxClose');
    const zoomIn = document.getElementById('zoomIn');
    const zoomOut = document.getElementById('zoomOut');
    const zoomReset = document.getElementById('zoomReset');
    const imgContainer = document.getElementById('lightboxImageContainer');

    let currentZoom = 1;

    images.forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => {
            const src = img.getAttribute('src');
            const alt = img.getAttribute('alt');
            
            lightboxImg.src = src;
            lightboxImg.alt = alt;
            lightboxCaption.textContent = alt;
            
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            resetZoom();
        });
    });

    function closeLightbox() {
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
        resetZoom();
    }

    function resetZoom() {
        currentZoom = 1;
        updateZoom();
    }

    function updateZoom() {
        lightboxImg.style.transform = `scale(${currentZoom})`;
    }

    closeBtn?.addEventListener('click', closeLightbox);
    overlay?.addEventListener('click', (e) => {
        if (e.target === overlay || e.target === imgContainer) {
            closeLightbox();
        }
    });

    zoomIn?.addEventListener('click', () => {
        currentZoom += 0.2;
        updateZoom();
    });

    zoomOut?.addEventListener('click', () => {
        if (currentZoom > 0.4) {
            currentZoom -= 0.2;
            updateZoom();
        }
    });

    zoomReset?.addEventListener('click', resetZoom);

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
});
