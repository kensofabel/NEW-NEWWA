// inventory-modal.js
// Handles Add Item modal logic for Inventory page

document.addEventListener('DOMContentLoaded', function() {
    // Modal elements
    const modal = document.getElementById('addItemModal');
    const openBtn = document.getElementById('addProductBtn');
    const closeBtn = document.getElementById('closeAddItemModal');
    const scanTab = document.getElementById('scanTab');
    const manualTab = document.getElementById('manualTab');
    const scanContent = document.getElementById('scanContent');
    const manualContent = document.getElementById('manualContent');

    // Open modal
    openBtn.addEventListener('click', function() {
        modal.style.display = 'flex';
        scanTab.classList.add('active');
        manualTab.classList.remove('active');
        scanContent.style.display = 'block';
        manualContent.style.display = 'none';
    });

    // Close modal
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Tab switching
    scanTab.addEventListener('click', function() {
        scanTab.classList.add('active');
        manualTab.classList.remove('active');
        scanContent.style.display = 'block';
        manualContent.style.display = 'none';
    });
    manualTab.addEventListener('click', function() {
        manualTab.classList.add('active');
        scanTab.classList.remove('active');
        scanContent.style.display = 'none';
        manualContent.style.display = 'block';
    });

    // Optional: Close modal on outside click
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});
