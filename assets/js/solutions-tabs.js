document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    function activateTab(target) {
        // Update buttons
        tabBtns.forEach(b => {
            if (b.getAttribute('data-target') === target) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });

        // Update content with animation
        tabContents.forEach(content => {
            if (content.id === target) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
        
        // Re-trigger fade-in animations if needed
        const element = document.getElementById(target);
        if (element) {
            const animatedElements = element.querySelectorAll('.fade-in');
            animatedElements.forEach(el => {
                el.classList.remove('fade-in');
                void el.offsetWidth; // Trigger reflow
                el.classList.add('fade-in');
            });
        }
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = btn.getAttribute('data-target');
            activateTab(target);
            history.pushState(null, null, '#' + target);
        });
    });

    // Handle hash on load
    if (window.location.hash) {
        const target = window.location.hash.substring(1);
        const validTargets = Array.from(tabBtns).map(b => b.getAttribute('data-target'));
        if (validTargets.includes(target)) {
            activateTab(target);
        }
    }

    // --- Automated Image Slider Logic ---
    const sliders = document.querySelectorAll('.image-display-box');

    sliders.forEach(slider => {
        const images = slider.querySelectorAll('.slider-img');
        const dots = slider.querySelectorAll('.dot');
        let currentIndex = 0;
        let interval;

        const showImage = (index) => {
            images.forEach(img => img.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));

            images[index].classList.add('active');
            dots[index].classList.add('active');
            currentIndex = index;
        };

        const nextImage = () => {
            let nextIndex = (currentIndex + 1) % images.length;
            showImage(nextIndex);
        };

        const startAutoPlay = () => {
            interval = setInterval(nextImage, 4000); // 4 seconds
        };

        const stopAutoPlay = () => {
            clearInterval(interval);
        };

        // Initialize first slider
        startAutoPlay();

        // Pause on hover
        slider.addEventListener('mouseenter', stopAutoPlay);
        slider.addEventListener('mouseleave', startAutoPlay);

        // Manual Navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showImage(index);
            });
        });
    });
});
