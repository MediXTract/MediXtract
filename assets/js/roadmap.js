/**
 * Roadmap Accordion Logic
 * Handles the expansion/collapse of roadmap phases.
 */

function toggleRoadmapDetails(button) {
    const roadmapItem = button.closest('.roadmap-item');
    const extendedContent = roadmapItem.querySelector('.roadmap-extended');
    const summaryContent = roadmapItem.querySelector('.roadmap-summary');
    const toggleText = button.querySelector('.toggle-text');
    const icon = button.querySelector('i');
    
    if (roadmapItem.classList.contains('active')) {
        // Collapse
        roadmapItem.classList.remove('active');
        if (toggleText) toggleText.textContent = 'Read More';
        if (icon) icon.style.transform = 'rotate(0deg)';
    } else {
        // Expand
        roadmapItem.classList.add('active');
        if (toggleText) toggleText.textContent = 'Read Less';
        if (icon) icon.style.transform = 'rotate(180deg)';
    }
}

// Advantages Section Accordion (if using data-accordion)
document.addEventListener('DOMContentLoaded', () => {
    const accordionItems = document.querySelectorAll('.checkmark-item[data-accordion]');
    
    accordionItems.forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('active');
            const icon = item.querySelector('.checkmark-toggle i');
            if (icon) {
                icon.style.transform = item.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        });
    });
});
