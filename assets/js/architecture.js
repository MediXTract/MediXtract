/**
 * Secure Hub-and-Spoke Navigation Logic
 * Fixes transition conflicts and guarantees directional accuracy.
 */
function initArchitecture() {
    const stage = document.querySelector('.arch-stage');
    if (!stage) return;

    const navs = {
        up: document.querySelector('.nav-up'),
        down: document.querySelector('.nav-down'),
        left: document.querySelector('.nav-left'),
        right: document.querySelector('.nav-right')
    };

    let currentState = 'hub';

    function updateUI(state) {
        // Reset all navigation visibility
        Object.values(navs).forEach(n => n.classList.remove('visible'));

        // Set the mode on the container for CSS transitions
        stage.className = `arch-stage mode-${state}`;
        currentState = state;

        // Show allowed arrows based on logic
        if (state === 'hub') {
            navs.up.classList.add('visible');
            navs.down.classList.add('visible');
            navs.left.classList.add('visible');
            navs.right.classList.add('visible');
        } else if (state === 'architect') {
            navs.down.classList.add('visible'); // Back to hub
        } else if (state === 'advisory') {
            navs.up.classList.add('visible');    // Back to hub
        } else if (state === 'extractor') {
            navs.right.classList.add('visible'); // Back to hub
        } else if (state === 'vertex') {
            navs.left.classList.add('visible');  // Back to hub
        }
    }

    // click handlers for directional arrows
    navs.up.onclick = () => {
        if (currentState === 'hub') updateUI('architect');
        else if (currentState === 'advisory') updateUI('hub');
    };

    navs.down.onclick = () => {
        if (currentState === 'hub') updateUI('advisory');
        else if (currentState === 'architect') updateUI('hub');
    };

    navs.left.onclick = () => {
        if (currentState === 'hub') updateUI('extractor');
        else if (currentState === 'vertex') updateUI('hub');
    };

    navs.right.onclick = () => {
        if (currentState === 'hub') updateUI('vertex');
        else if (currentState === 'extractor') updateUI('hub');
    };

    // Force initial state
    updateUI('hub');
}

document.addEventListener('DOMContentLoaded', initArchitecture);
