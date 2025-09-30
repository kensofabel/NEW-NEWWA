document.addEventListener('DOMContentLoaded', function () {
    const inventoryTableBody = document.getElementById('inventory-table-body');
    const addProductForm = document.getElementById('add-product-form');
    const searchInput = document.getElementById('search-inventory');

    // Fetch and display inventory products
    function fetchInventory() {
        fetch('api.php')
            .then(response => response.json())
            .then(data => {
                displayInventory(data);
            })
            .catch(error => {
                console.error('Error fetching inventory:', error);
            });
    }

    // Display inventory in table
    function displayInventory(products) {
        inventoryTableBody.innerHTML = '';
        products.forEach(product => {
            const tr = document.createElement('tr');

            const status = product.quantity > 0 ? 'In Stock' : 'Out of Stock';

            tr.innerHTML = `
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>$${parseFloat(product.unit_price).toFixed(2)}</td>
                <td>${product.quantity}</td>
                <td>${status}</td>
                <td>
                    <!-- Actions like edit/delete can be added here -->
                    <button class="edit-btn" data-id="${product.id}">Edit</button>
                    <button class="delete-btn" data-id="${product.id}">Delete</button>
                </td>
            `;
            inventoryTableBody.appendChild(tr);
        });
    }

    // Handle add product form submission (will be implemented later)
    // addProductForm.addEventListener('submit', function (e) {
    //     // Form submission logic will be added after barcode scanning
    // });

    // Search filter
    searchInput.addEventListener('input', function () {
        const filter = searchInput.value.toLowerCase();
        const rows = inventoryTableBody.getElementsByTagName('tr');
        Array.from(rows).forEach(row => {
            const productName = row.cells[0].textContent.toLowerCase();
            if (productName.indexOf(filter) > -1) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // Initial fetch
    fetchInventory();

    // Scanner Modal Logic
    const scannerModal = document.getElementById('scannerModal');
    const addBtn = document.getElementById('addProductBtn');
    const closeScanner = document.getElementById('closeScanner');
    const scanTab = document.getElementById('scanTab');
    const manualTab = document.getElementById('manualTab');
    const scannerMode = document.getElementById('scannerMode');
    const manualMode = document.getElementById('manualMode');
    const cameraScanner = document.getElementById('cameraScanner');
    const hardwareScanner = document.getElementById('hardwareScanner');
    const nextBtn = document.getElementById('nextBtn');
    const skipBtn = document.getElementById('skipBtn');
    
    // Debug: Check if elements exist
    console.log('Scanner Modal Elements Check:');
    console.log('scannerModal:', scannerModal);
    console.log('addBtn:', addBtn);
    console.log('closeScanner:', closeScanner);
    console.log('scanTab:', scanTab);
    console.log('manualTab:', manualTab);
    
    let cameraStream = null;
    let isManualMode = false;
    
    // Check for hardware scanner
    function checkHardwareScanner() {
        return new Promise((resolve) => {
            // Simulate hardware scanner detection
            setTimeout(() => {
                const hasHardware = Math.random() > 0.7; // 30% chance for demo
                resolve(hasHardware);
            }, 500);
        });
    }
    
    // Initialize camera
    async function initCamera() {
        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                } 
            });
            document.getElementById('cameraVideo').srcObject = cameraStream;
            return true;
        } catch (error) {
            console.error('Camera access denied:', error);
            return false;
        }
    }
    
    // Stop camera
    function stopCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
        }
    }
    
    // Show scanner modal
    async function showScannerModal() {
        console.log('showScannerModal called'); // Debug log
        
        if (!scannerModal) {
            console.error('scannerModal element not found!');
            alert('Scanner modal not found! Please check the HTML structure.');
            return;
        }
        
        scannerModal.classList.add('show');
        console.log('Modal show class added'); // Debug log
        
        isManualMode = false;
        
        // Set initial tab state
        if (scanTab) {
            scanTab.classList.add('active');
        }
        if (manualTab) {
            manualTab.classList.remove('active');
        }
        
        // Show scanner mode
        if (scannerMode) {
            scannerMode.style.display = 'flex';
        }
        if (manualMode) {
            manualMode.style.display = 'none';
        }
        
        // Check for hardware scanner
        const hasHardware = await checkHardwareScanner();
        
        if (hasHardware) {
            // Show hardware scanner
            if (cameraScanner) cameraScanner.style.display = 'none';
            if (hardwareScanner) hardwareScanner.style.display = 'block';
            listenForHardwareScanner();
        } else {
            // Show camera scanner
            if (hardwareScanner) hardwareScanner.style.display = 'none';
            if (cameraScanner) cameraScanner.style.display = 'block';
            await initCamera();
        }
    }
    
    // Listen for hardware scanner input
    function listenForHardwareScanner() {
        let barcodeBuffer = '';
        
        const handleKeyPress = (e) => {
            if (e.key === 'Enter' && barcodeBuffer.length > 0) {
                handleBarcodeScanned(barcodeBuffer);
                document.removeEventListener('keypress', handleKeyPress);
            } else if (e.key.length === 1) {
                barcodeBuffer += e.key;
            }
        };
        
        document.addEventListener('keypress', handleKeyPress);
    }
    
    // Handle barcode scanned
    function handleBarcodeScanned(barcode) {
        console.log('Barcode scanned:', barcode);
        closeScannerModal();
        // Here you would proceed to next step with barcode data
        alert(`Barcode scanned: ${barcode}\nWould proceed to product form...`);
    }
    
    // Switch to scanner mode
    function switchToScanMode() {
        isManualMode = false;
        
        // Update tab states
        if (scanTab) {
            scanTab.classList.add('active');
        }
        if (manualTab) {
            manualTab.classList.remove('active');
        }
        
        // Show scanner mode
        if (scannerMode) {
            scannerMode.style.display = 'flex';
        }
        if (manualMode) {
            manualMode.style.display = 'none';
        }
        
        // Reinitialize scanner
        checkAndInitializeScanner();
    }
    
    // Switch to manual mode
    function switchToManualMode() {
        isManualMode = true;
        
        // Update tab states
        if (scanTab) {
            scanTab.classList.remove('active');
        }
        if (manualTab) {
            manualTab.classList.add('active');
        }
        
        // Show manual mode
        if (scannerMode) {
            scannerMode.style.display = 'none';
        }
        if (manualMode) {
            manualMode.style.display = 'flex';
        }
        
        stopCamera();
        
    // Do not clear manual inputs here; keep user data
    }
    
    // Check and initialize scanner (helper function)
    async function checkAndInitializeScanner() {
        const hasHardware = await checkHardwareScanner();
        
        if (hasHardware) {
            if (cameraScanner) cameraScanner.style.display = 'none';
            if (hardwareScanner) hardwareScanner.style.display = 'block';
            listenForHardwareScanner();
        } else {
            if (hardwareScanner) hardwareScanner.style.display = 'none';
            if (cameraScanner) cameraScanner.style.display = 'block';
            await initCamera();
        }
    }
    
    // Handle manual next button
    function handleManualNext() {
        const barcode = document.getElementById('manualBarcode').value.trim();
        const sku = document.getElementById('manualSKU').value.trim();
        
        if (!barcode && !sku) {
            alert('Please enter at least a barcode or SKU');
            return;
        }
        
        console.log('Manual entry:', { barcode, sku });
        closeScannerModal();
        // Here you would proceed to next step with manual data
        alert(`Manual entry:\nBarcode: ${barcode || 'Not provided'}\nSKU: ${sku || 'Not provided'}\nWould proceed to product form...`);
    }
    

    
    // Skip scanning/manual entry - go directly to form
    function handleSkip() {
        switchToFormMode();
    }
    
    // Switch to form mode
    function switchToFormMode() {
        // Add form-mode class to modal for styling
        if (scannerModal) {
            scannerModal.querySelector('.scanner-modal').classList.add('form-mode');
        }
        
        // Hide scanner and manual modes
        if (scannerMode) {
            scannerMode.style.display = 'none';
        }
        if (manualMode) {
            manualMode.style.display = 'none';
        }
        
        // Show form mode
        if (formMode) {
            formMode.style.display = 'flex';
        }
        
        // Hide tab navigation and skip section when in form mode
        const tabButtons = document.querySelectorAll('.scanner-tab');
        const skipSection = document.querySelector('.skip-section');
        
        tabButtons.forEach(tab => {
            tab.style.display = 'none';
        });
        
        if (skipSection) {
            skipSection.style.display = 'none';
        }
        
        stopCamera();
        
        // Populate form with data from manual mode if available
        const barcodeChecked = enableBarcodeCheckbox && enableBarcodeCheckbox.checked;
        const skuChecked = enableSKUCheckbox && enableSKUCheckbox.checked;
        const barcodeData = barcodeInput ? barcodeInput.value.trim() : '';
        const skuData = skuInput ? skuInput.value.trim() : '';
        
        if (barcodeChecked && barcodeData) {
            document.getElementById('productBarcode').value = barcodeData;
        }
        if (skuChecked && skuData) {
            document.getElementById('productSKU').value = skuData;
        }
    }
    
    // Handle Next button - proceed to form with data
    function handleNext() {
        const barcodeChecked = enableBarcodeCheckbox.checked;
        const skuChecked = enableSKUCheckbox.checked;
        const barcodeData = barcodeInput.value.trim();
        const skuData = skuInput.value.trim();
        
        console.log('Proceeding with data:', {
            barcode: barcodeChecked ? barcodeData : null,
            sku: skuChecked ? skuData : null
        });
        
        switchToFormMode();
    }
    
    // Go back from form to tabs
    function goBackToTabs() {
        // Remove form-mode class from modal
        if (scannerModal) {
            scannerModal.querySelector('.scanner-modal').classList.remove('form-mode');
        }
        
        // Hide form mode
        if (formMode) {
            formMode.style.display = 'none';
        }
        
        // Show scanner mode by default
        if (scannerMode) {
            scannerMode.style.display = 'flex';
        }
        
        // Show tab navigation and skip section
        const tabButtons = document.querySelectorAll('.scanner-tab');
        const skipSection = document.querySelector('.skip-section');
        
        tabButtons.forEach(tab => {
            tab.style.display = 'inline-block';
        });
        
        if (skipSection) {
            skipSection.style.display = 'block';
        }
        
        // Reset tab states to scanner mode
        if (scanTab) {
            scanTab.classList.add('active');
        }
        if (manualTab) {
            manualTab.classList.remove('active');
        }
        
        // Reinitialize scanner
        checkAndInitializeScanner();
    }
    
    // Close scanner modal
    function closeScannerModal() {
        stopCamera();
        scannerModal.classList.remove('show');
        
        // Remove form-mode class from modal
        if (scannerModal) {
            scannerModal.querySelector('.scanner-modal').classList.remove('form-mode');
        }
        
        // Reset to scanner mode for next time
        isManualMode = false;
        
        // Show scanner mode and hide others
        if (scannerMode) {
            scannerMode.style.display = 'flex';
        }
        if (manualMode) {
            manualMode.style.display = 'none';
        }
        if (formMode) {
            formMode.style.display = 'none';
        }
        
        // Reset tab states
        if (scanTab) {
            scanTab.classList.add('active');
        }
        if (manualTab) {
            manualTab.classList.remove('active');
        }
        
        // Show tab buttons and skip section
        const tabButtons = document.querySelectorAll('.scanner-tab');
        const skipSection = document.querySelector('.skip-section');
        
        tabButtons.forEach(tab => {
            tab.style.display = 'inline-block';
        });
        
        if (skipSection) {
            skipSection.style.display = 'block';
        }
        
        // Do not clear or disable manual inputs or uncheck checkboxes here; keep user data
        // updateNextButtonState();
        
        // Reset form fields
        const productForm = document.getElementById('formMode');
        if (productForm) {
            const inputs = productForm.querySelectorAll('input[type="text"], input[type="number"], select');
            inputs.forEach(input => {
                input.value = '';
            });
            const checkboxes = productForm.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            if (representationSection) {
                representationSection.style.display = 'none';
            }
        }
    }
    
    // Event listeners - Check if elements exist before binding
    if (addBtn) {
        addBtn.onclick = function() {
            console.log('Add Item button clicked'); // Debug log
            showScannerModal();
        };
    } else {
        console.error('addProductBtn element not found!');
    }
    
    if (closeScanner) {
        closeScanner.onclick = closeScannerModal;
    }
    
    if (scanTab) {
        scanTab.onclick = switchToScanMode;
    }
    
    if (manualTab) {
        manualTab.onclick = switchToManualMode;
    }
    
    if (nextBtn) {
        nextBtn.onclick = handleNext;
    }
    

    
    if (skipBtn) {
        skipBtn.onclick = handleSkip;
    }
    
    // Close modal on outside click
    window.onclick = function(e) {
        if (scannerModal && e.target === scannerModal) {
            closeScannerModal();
        }
    };
    
    // Close modal on Escape key
    window.onkeydown = function(e) {
        if (e.key === 'Escape' && scannerModal && scannerModal.classList.contains('show')) {
            closeScannerModal();
        }
    };
    
    // Manual entry fields are always enabled; checkboxes have no effect
    // Track Stock checkbox functionality
    const trackStockCheckbox = document.getElementById('trackStock');
    const stockSection = document.getElementById('stockSection');
    const goBackBtn = document.getElementById('goBackBtn');

    if (trackStockCheckbox && stockSection) {
        trackStockCheckbox.addEventListener('change', function() {
            if (this.checked) {
                stockSection.style.display = 'block';
            } else {
                stockSection.style.display = 'none';
            }
        });
    }

    if (goBackBtn) {
        goBackBtn.addEventListener('click', goBackToTabs);
    }

});

// Checkbox auto-check/uncheck logic for manual SKU/Barcode
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        var skuInput = document.getElementById('manualSKU');
        var skuCheckbox = document.getElementById('enableSKU');
        var barcodeInput = document.getElementById('manualBarcode');
        var barcodeCheckbox = document.getElementById('enableBarcode');

        if (skuInput && skuCheckbox) {
            skuInput.addEventListener('focus', function() {
                skuCheckbox.checked = true;
            });
            // Remove blur handler that re-checks the box
            skuInput.addEventListener('input', function() {
                if (skuInput.value.trim()) {
                    skuCheckbox.checked = true;
                }
            });
        }
        if (barcodeInput && barcodeCheckbox) {
            barcodeInput.addEventListener('focus', function() {
                barcodeCheckbox.checked = true;
            });
            // Remove blur handler that re-checks the box
            barcodeInput.addEventListener('input', function() {
                if (barcodeInput.value.trim()) {
                    barcodeCheckbox.checked = true;
                }
            });
        }
    });
})();

// Floating label: toggle .active on .form-group for robust behavior
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        function updateFormGroupActive(input, checkbox) {
            var group = input.closest('.form-group');
            if (!group) return;
            if (checkbox.checked && input.value.trim()) {
                group.classList.add('active');
            } else {
                group.classList.remove('active');
            }
        }
        var skuInput = document.getElementById('manualSKU');
        var skuCheckbox = document.getElementById('enableSKU');
        var barcodeInput = document.getElementById('manualBarcode');
        var barcodeCheckbox = document.getElementById('enableBarcode');
        if (skuInput && skuCheckbox) {
            skuInput.addEventListener('input', function() {
                updateFormGroupActive(skuInput, skuCheckbox);
            });
            skuCheckbox.addEventListener('change', function() {
                updateFormGroupActive(skuInput, skuCheckbox);
                if (skuCheckbox.checked) {
                    if (document.activeElement !== skuInput) {
                        skuInput.focus(); // Only focus if not already focused
                    }
                } else {
                    skuInput.value = '';
                    updateFormGroupActive(skuInput, skuCheckbox);
                    if (document.activeElement === skuInput) {
                        skuInput.blur(); // Blur if focused
                    }
                }
            });
            // On page load
            updateFormGroupActive(skuInput, skuCheckbox);
        }
        if (barcodeInput && barcodeCheckbox) {
            barcodeInput.addEventListener('input', function() {
                updateFormGroupActive(barcodeInput, barcodeCheckbox);
            });
            barcodeCheckbox.addEventListener('change', function() {
                updateFormGroupActive(barcodeInput, barcodeCheckbox);
                if (barcodeCheckbox.checked) {
                    if (document.activeElement !== barcodeInput) {
                        barcodeInput.focus();
                    }
                } else {
                    barcodeInput.value = '';
                    updateFormGroupActive(barcodeInput, barcodeCheckbox);
                    if (document.activeElement === barcodeInput) {
                        barcodeInput.blur();
                    }
                }
            });
            // On page load
            updateFormGroupActive(barcodeInput, barcodeCheckbox);
        }
    });
})();