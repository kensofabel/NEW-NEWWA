// Declare scannerModal only once at the top
const scannerModal = document.getElementById('scannerModal');

document.addEventListener('DOMContentLoaded', function () {
    // Helper to enable/disable Next button
    function updateNextButtonState() {
        var skuInput = document.getElementById('manualSKU');
        var skuCheckbox = document.getElementById('enableSKU');
        var barcodeInput = document.getElementById('manualBarcode');
        var barcodeCheckbox = document.getElementById('enableBarcode');
        var nextBtn = document.getElementById('nextBtn');
        if (!nextBtn) return;
        // Button enabled if checked input has value
        var skuValid = skuCheckbox && skuCheckbox.checked && skuInput && skuInput.value.trim();
        var barcodeValid = barcodeCheckbox && barcodeCheckbox.checked && barcodeInput && barcodeInput.value.trim();
        nextBtn.disabled = !(skuValid || barcodeValid);
    }

    // Auto-focus input when checkbox is checked
    function setupCheckboxAutoFocus() {
        var skuInput = document.getElementById('manualSKU');
        var skuCheckbox = document.getElementById('enableSKU');
        var barcodeInput = document.getElementById('manualBarcode');
        var barcodeCheckbox = document.getElementById('enableBarcode');
        
        // Flags to prevent blur interference during manual interaction
        var skuIgnoreBlur = false;
        var barcodeIgnoreBlur = false;

        if (skuCheckbox && skuInput) {
            // Set flag when clicking on checkbox to prevent blur interference
            skuCheckbox.addEventListener('mousedown', function() {
                if (skuCheckbox.checked) { // If currently checked, user is about to uncheck
                    skuIgnoreBlur = true;
                }
            });
            
            skuCheckbox.addEventListener('change', function() {
                if (skuCheckbox.checked) {
                    skuIgnoreBlur = false; // Reset flag when checking
                    skuInput.focus();
                } else {
                    skuInput.value = '';
                    skuInput.blur();
                    // Reset flag after unchecking is complete
                    setTimeout(function() {
                        skuIgnoreBlur = false;
                    }, 100);
                }
                updateNextButtonState();
            });
            
            // Also listen to input changes for Next button validation
            skuInput.addEventListener('input', updateNextButtonState);
            
            // Auto-uncheck checkbox if input loses focus with no data
            skuInput.addEventListener('blur', function() {
                // Use setTimeout to ensure this runs after any checkbox click events
                setTimeout(function() {
                    if (!skuIgnoreBlur && skuCheckbox.checked && !skuInput.value.trim()) {
                        skuCheckbox.checked = false;
                        updateNextButtonState();
                    }
                }, 50);
            });
        }

        if (barcodeCheckbox && barcodeInput) {
            // Set flag when clicking on checkbox to prevent blur interference
            barcodeCheckbox.addEventListener('mousedown', function() {
                if (barcodeCheckbox.checked) { // If currently checked, user is about to uncheck
                    barcodeIgnoreBlur = true;
                }
            });
            
            barcodeCheckbox.addEventListener('change', function() {
                if (barcodeCheckbox.checked) {
                    barcodeIgnoreBlur = false; // Reset flag when checking
                    barcodeInput.focus();
                } else {
                    barcodeInput.value = '';
                    barcodeInput.blur();
                    // Reset flag after unchecking is complete
                    setTimeout(function() {
                        barcodeIgnoreBlur = false;
                    }, 100);
                }
                updateNextButtonState();
            });
            
            // Also listen to input changes for Next button validation
            barcodeInput.addEventListener('input', updateNextButtonState);
            
            // Auto-uncheck checkbox if input loses focus with no data
            barcodeInput.addEventListener('blur', function() {
                // Use setTimeout to ensure this runs after any checkbox click events
                setTimeout(function() {
                    if (!barcodeIgnoreBlur && barcodeCheckbox.checked && !barcodeInput.value.trim()) {
                        barcodeCheckbox.checked = false;
                        updateNextButtonState();
                    }
                }, 50);
            });
        }

        // Initialize Next button state
        updateNextButtonState();
    }

    // Initialize auto-focus functionality
    setupCheckboxAutoFocus();

    // Currency Auto-Prefix Functionality
    function setupCurrencyInputs() {
        // Get all inputs with currency-localization attribute
        const currencyInputs = document.querySelectorAll('input[currency-localization]');
        
        currencyInputs.forEach(function(input) {
            const prefix = input.getAttribute('currency-localization'); // Get the prefix (₱)
            
            // Don't set initial value - let placeholder show
            
            // Handle input event - add prefix when user starts typing
            input.addEventListener('input', function() {
                const value = this.value;
                
                // If empty, leave as is (shows placeholder)
                if (value === '') {
                    return;
                }
                
                // If user is typing and doesn't have prefix, add it
                if (value !== '' && !value.startsWith(prefix)) {
                    // Only add numbers and decimal points
                    const numericOnly = value.replace(/[^\d.]/g, '');
                    if (numericOnly) {
                        this.value = prefix + numericOnly;
                        // Set cursor position after the currency symbol
                        const cursorPos = prefix.length + numericOnly.length;
                        this.setSelectionRange(cursorPos, cursorPos);
                    }
                }
                
                // Ensure proper decimal formatting
                const currentValue = this.value;
                if (currentValue.startsWith(prefix)) {
                    const numericPart = currentValue.substring(prefix.length);
                    const parts = numericPart.split('.');
                    
                    // Limit decimal places to 2
                    if (parts.length > 1 && parts[1].length > 2) {
                        const correctedValue = prefix + parts[0] + '.' + parts[1].substring(0, 2);
                        this.value = correctedValue;
                    }
                }
            });
            
            // Handle keydown for special cases
            input.addEventListener('keydown', function(e) {
                // Allow backspace/delete to clear everything including prefix
                if (e.key === 'Backspace' || e.key === 'Delete') {
                    return; // Let default behavior handle it
                }
                
                // Prevent typing non-numeric characters (except decimal point)
                if (!/[\d.]/.test(e.key) && 
                    !['Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key) &&
                    !(e.ctrlKey && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase()))) {
                    e.preventDefault();
                }
            });
            
            // Handle blur event - format the value if it has content
            input.addEventListener('blur', function() {
                const value = this.value.trim();
                
                // If empty or just currency symbol, clear it
                if (value === '' || value === prefix) {
                    this.value = '';
                    return;
                }
                
                // If has currency symbol, format to 2 decimal places
                if (value.startsWith(prefix)) {
                    const numericPart = value.substring(prefix.length);
                    const floatValue = parseFloat(numericPart);
                    if (!isNaN(floatValue) && floatValue >= 0) {
                        this.value = prefix + floatValue.toFixed(2);
                    } else {
                        this.value = '';
                    }
                }
            });
        });
    }

    // Initialize currency functionality
    setupCurrencyInputs();
    
    // Category Autocomplete Functionality
    function setupCategoryAutocomplete() {
        const categoryInput = document.getElementById('inlineItemCategory');
        const categoryDropdown = document.getElementById('categoryDropdown');
        
        if (!categoryInput || !categoryDropdown) return;
        
        // Move dropdown to body to escape modal clipping
        document.body.appendChild(categoryDropdown);
        
        // Predefined categories (you can extend this list or fetch from API)
        const existingCategories = [
            'Fruits & Vegetables',
            'Dairy & Eggs', 
            'Meat & Poultry',
            'Bakery',
            'Beverages',
            'Snacks',
            'Frozen Foods',
            'Household',
            'Personal Care',
            'Cleaning Supplies',
            'Electronics',
            'Office Supplies'
        ];
        
        let highlightedIndex = -1;
        let filteredCategories = [];
        
        // Show dropdown with categories
        function showDropdown(categories, searchTerm = '') {
            categoryDropdown.innerHTML = '';
            filteredCategories = categories;
            highlightedIndex = -1;
            
            // Position dropdown below the input field
            const inputRect = categoryInput.getBoundingClientRect();
            categoryDropdown.style.top = (inputRect.bottom + 2) + 'px';
            categoryDropdown.style.left = inputRect.left + 'px';
            categoryDropdown.style.width = inputRect.width + 'px';
            
            if (categories.length === 0 && searchTerm.trim() !== '') {
                // Show "New Category" option when no matches
                const newOption = document.createElement('div');
                newOption.className = 'category-option new-category';
                newOption.innerHTML = `
                    <span>${searchTerm}</span>
                    <span class="category-new-indicator">New Category</span>
                `;
                newOption.addEventListener('click', () => selectCategory(searchTerm));
                categoryDropdown.appendChild(newOption);
                filteredCategories = [searchTerm];
            } else {
                categories.forEach((category, index) => {
                    const option = document.createElement('div');
                    option.className = 'category-option';
                    option.textContent = category;
                    option.addEventListener('click', () => selectCategory(category));
                    categoryDropdown.appendChild(option);
                });
            }
            
            categoryDropdown.classList.add('show');
        }
        
        // Hide dropdown
        function hideDropdown() {
            categoryDropdown.classList.remove('show');
            highlightedIndex = -1;
        }
        
        // Select category
        function selectCategory(category) {
            categoryInput.value = category;
            hideDropdown();
            categoryInput.blur();
        }
        
        // Filter categories based on input
        function filterCategories(searchTerm) {
            if (!searchTerm.trim()) {
                return existingCategories;
            }
            
            return existingCategories.filter(category => 
                category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Highlight option with keyboard navigation
        function highlightOption(index) {
            const options = categoryDropdown.querySelectorAll('.category-option');
            
            // Remove previous highlight
            options.forEach(option => option.classList.remove('highlighted'));
            
            // Add new highlight
            if (index >= 0 && index < options.length) {
                options[index].classList.add('highlighted');
                highlightedIndex = index;
            }
        }
        
        // Event listeners
        categoryInput.addEventListener('focus', () => {
            const filtered = filterCategories(categoryInput.value);
            showDropdown(filtered, categoryInput.value);
        });
        
        categoryInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value;
            const filtered = filterCategories(searchTerm);
            showDropdown(filtered, searchTerm);
        });
        
        categoryInput.addEventListener('keydown', (e) => {
            const options = categoryDropdown.querySelectorAll('.category-option');
            
            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    highlightedIndex = Math.min(highlightedIndex + 1, options.length - 1);
                    highlightOption(highlightedIndex);
                    break;
                    
                case 'ArrowUp':
                    e.preventDefault();
                    highlightedIndex = Math.max(highlightedIndex - 1, 0);
                    highlightOption(highlightedIndex);
                    break;
                    
                case 'Enter':
                    e.preventDefault();
                    if (highlightedIndex >= 0 && filteredCategories[highlightedIndex]) {
                        selectCategory(filteredCategories[highlightedIndex]);
                    } else if (categoryInput.value.trim()) {
                        // If no highlighted option but there's text, create new category
                        selectCategory(categoryInput.value.trim());
                    }
                    break;
                    
                case 'Escape':
                    e.preventDefault();
                    hideDropdown();
                    categoryInput.blur();
                    break;
            }
        });
        
        // Hide dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!categoryInput.contains(e.target) && !categoryDropdown.contains(e.target)) {
                hideDropdown();
            }
        });
        
        // Hide dropdown when input loses focus (with small delay for click handling)
        categoryInput.addEventListener('blur', (e) => {
            setTimeout(() => {
                if (!categoryDropdown.contains(document.activeElement)) {
                    hideDropdown();
                }
            }, 100);
        });
    }
    
    // Initialize category autocomplete functionality
    setupCategoryAutocomplete();
    
    // Track Stock Toggle Functionality
    function setupTrackStockToggle() {
        const trackStockToggle = document.getElementById('inlineTrackStockToggle');
        const stockFieldsRow = document.getElementById('stockFieldsRow');
        const inStockInput = document.getElementById('inlineInStock');
        const lowStockInput = document.getElementById('inlineLowStock');
        
        if (!trackStockToggle || !stockFieldsRow) return;
        
        // Handle toggle change
        trackStockToggle.addEventListener('change', function() {
            if (this.checked) {
                // Show stock fields
                stockFieldsRow.style.display = 'flex';
                // Make fields required when visible
                if (inStockInput) inStockInput.setAttribute('required', 'required');
                if (lowStockInput) lowStockInput.setAttribute('required', 'required');
            } else {
                // Hide stock fields
                stockFieldsRow.style.display = 'none';
                // Remove required attribute and clear values
                if (inStockInput) {
                    inStockInput.removeAttribute('required');
                    inStockInput.value = '';
                }
                if (lowStockInput) {
                    lowStockInput.removeAttribute('required');
                    lowStockInput.value = '';
                }
            }
        });
        
        // Initialize state (hidden by default)
        stockFieldsRow.style.display = 'none';
    }
    
    // Initialize track stock toggle functionality
    setupTrackStockToggle();
    
    // Quantity Suffix Functionality
    function setupQuantitySuffix() {
        // Find all inputs with quantity-suffix attribute
        const quantityInputs = document.querySelectorAll('input[quantity-suffix]');
        
        quantityInputs.forEach(function(input) {
            const suffix = input.getAttribute('quantity-suffix'); // Get the suffix (e.g., " | pcs")
            
            // Handle input event - add suffix when user starts typing
            input.addEventListener('input', function() {
                let value = this.value;
                
                // If empty, leave as is (shows placeholder)
                if (value === '') {
                    return;
                }
                
                // Remove suffix temporarily to get clean value
                if (value.endsWith(suffix)) {
                    value = value.substring(0, value.length - suffix.length);
                }
                
                // Only allow numbers and decimal points
                value = value.replace(/[^\d.]/g, '');
                
                // Ensure only one decimal point
                const parts = value.split('.');
                if (parts.length > 2) {
                    value = parts[0] + '.' + parts.slice(1).join('');
                }
                
                // Add suffix back if there's a value
                if (value !== '') {
                    this.value = value + suffix;
                    
                    // Set cursor position before the suffix
                    const cursorPos = value.length;
                    this.setSelectionRange(cursorPos, cursorPos);
                }
            });
            
            // Handle keydown for special cases
            input.addEventListener('keydown', function(e) {
                const value = this.value;
                const cursorPos = this.selectionStart;
                const suffixStartPos = value.length - suffix.length;
                
                // Prevent cursor from moving into or deleting the suffix
                if (cursorPos > suffixStartPos && value.endsWith(suffix)) {
                    if (['Backspace', 'Delete', 'ArrowRight', 'End'].includes(e.key)) {
                        e.preventDefault();
                        // Move cursor to before suffix
                        this.setSelectionRange(suffixStartPos, suffixStartPos);
                    }
                }
                
                // Allow only numbers, decimal point, and navigation keys
                if (!/[\d.]/.test(e.key) && 
                    !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key) &&
                    !(e.ctrlKey && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase()))) {
                    e.preventDefault();
                }
            });
            
            // Handle click to prevent cursor from going into suffix
            input.addEventListener('click', function() {
                const value = this.value;
                const cursorPos = this.selectionStart;
                const suffixStartPos = value.length - suffix.length;
                
                if (cursorPos > suffixStartPos && value.endsWith(suffix)) {
                    this.setSelectionRange(suffixStartPos, suffixStartPos);
                }
            });
            
            // Handle focus to select numeric part only
            input.addEventListener('focus', function() {
                const value = this.value;
                if (value.endsWith(suffix)) {
                    const numericLength = value.length - suffix.length;
                    setTimeout(() => {
                        this.setSelectionRange(0, numericLength);
                    }, 0);
                }
            });
            
            // Handle blur to clean up the value
            input.addEventListener('blur', function() {
                let value = this.value;
                
                // If empty or just suffix, clear completely
                if (value === '' || value === suffix) {
                    this.value = '';
                    return;
                }
                
                // If has suffix, validate and format the numeric part
                if (value.endsWith(suffix)) {
                    const numericPart = value.substring(0, value.length - suffix.length);
                    const floatValue = parseFloat(numericPart);
                    if (!isNaN(floatValue) && floatValue >= 0) {
                        // Keep as is for whole numbers, or format decimals properly
                        const formattedValue = floatValue % 1 === 0 ? floatValue.toString() : floatValue.toFixed(2).replace(/\.?0+$/, '');
                        this.value = formattedValue + suffix;
                    } else {
                        this.value = '';
                    }
                }
            });
        });
    }
    
    // Initialize quantity suffix functionality
    setupQuantitySuffix();
    
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
    const addBtn = document.getElementById('addProductBtn');
    const closeScanner = document.getElementById('closeScanner');
    const scanTab = document.getElementById('scanTab');
    const manualTab = document.getElementById('manualTab');
    const scannerMode = document.getElementById('scannerMode');
    const manualMode = document.getElementById('manualMode');
    const cameraScanner = document.getElementById('cameraScanner');
    const hardwareScanner = document.getElementById('hardwareScanner');
    const nextBtn = document.getElementById('nextBtn');
    const skipScannerBtn = document.getElementById('skipScanner');
    const skipManualEntryBtn = document.getElementById('skipManualEntry');
    const addItemsModal = document.getElementById('addItemsModal');
    const addItemsModalContent = addItemsModal ? addItemsModal.querySelector('.modal-content') : null;
    const closeAddItemsBtn = document.getElementById('closeAddItems');
    const inlineAddItemsMount = document.getElementById('inlineAddItemsMount');
    const inlineTpl = document.getElementById('inlineAddItemsTemplate');
    const baseAddFlow = document.getElementById('baseAddFlow');

    function resetAddItemsAnim() {
        if (!addItemsModal || !addItemsModalContent) return;
        addItemsModal.classList.remove('fb-backdrop-in', 'fb-backdrop-out');
        addItemsModalContent.classList.remove('fb-modal-in', 'fb-modal-out');
        addItemsModalContent.classList.remove('modal-slide-in', 'modal-slide-left');
    }

    // Show Add Items modal with transition (animate content only)
    function showAddItemsModalWithTransition() {
        if (!addItemsModal || !addItemsModalContent) return;
        resetAddItemsAnim();
        addItemsModal.style.display = 'flex'; // center using flex; no backdrop anim
        // Force reflow for content anim
        void addItemsModalContent.offsetWidth;
        addItemsModalContent.classList.add('modal-slide-in');
        addItemsModalContent.addEventListener('animationend', function handler() {
            addItemsModalContent.classList.remove('modal-slide-in');
            addItemsModalContent.removeEventListener('animationend', handler);
        });
    }

    // Hide Add Items modal with transition (animate content only)
    function closeAddItemsModal() {
        if (!addItemsModal || !addItemsModalContent) return;
        // Content out only; no backdrop animation
        addItemsModalContent.classList.remove('modal-slide-in');
        addItemsModalContent.classList.add('modal-slide-left');
        addItemsModalContent.addEventListener('animationend', function handler() {
            addItemsModal.style.display = 'none';
            addItemsModalContent.classList.remove('modal-slide-left');
            addItemsModalContent.removeEventListener('animationend', handler);
        });
    }

    // Attach event listeners to skip buttons
    if (skipScannerBtn) {
        skipScannerBtn.addEventListener('click', function () {
            // Prefer inline panel if mount and template exist
            if (inlineAddItemsMount && inlineTpl) {
                openInlineAddItemsPanel();
            } else {
                showAddItemsModalWithTransition();
            }
        });
    }
    if (skipManualEntryBtn) {
        skipManualEntryBtn.addEventListener('click', function () {
            if (inlineAddItemsMount && inlineTpl) {
                openInlineAddItemsPanel();
            } else {
                showAddItemsModalWithTransition();
            }
        });
    }
    if (closeAddItemsBtn) {
        closeAddItemsBtn.addEventListener('click', function () {
            closeAddItemsModal();
        });
    }

    // Inline Add Items Panel logic
    function openInlineAddItemsPanel() {
        // Guard: already open
        if (document.getElementById('inlineAddItemsPanel')) return;
        const node = inlineTpl.content.firstElementChild.cloneNode(true);
        inlineAddItemsMount.appendChild(node);
        if (baseAddFlow) baseAddFlow.classList.add('slide-out-left');
        requestAnimationFrame(() => {
            node.classList.add('show');
        });

        // Close button handler
    const backBtn = node.querySelector('#backInlineAddItems');
    if (backBtn) backBtn.addEventListener('click', () => closeInlineAddItemsPanel());

        // Submit handler
        const form = node.querySelector('#inlineAddItemsForm');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const name = node.querySelector('#inlineItemName').value.trim();
                const category = node.querySelector('#inlineItemCategory').value.trim();
                const trackStock = node.querySelector('#inlineTrackStock').checked;
                const availablePOS = node.querySelector('#inlineAvailablePOS').checked;
                console.log('Inline Add Item:', { name, category, trackStock, availablePOS });
                closeInlineAddItemsPanel();
                return false;
            });
        }
    }

    function closeInlineAddItemsPanel() {
        const panel = document.getElementById('inlineAddItemsPanel');
        if (!panel) return;
        panel.classList.remove('show');
        // Wait for CSS transition
        setTimeout(() => {
            panel.remove();
            if (baseAddFlow) baseAddFlow.classList.remove('slide-out-left');
        }, 400);
    }
    
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
                stockSection.style.display = 'block';d
            } else {
                stockSection.style.display = 'none';
            }
        });
    }

    if (goBackBtn) {
        goBackBtn.addEventListener('click', goBackToTabs);
    }

    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn && scannerModal) {
        addProductBtn.onclick = function() {
            scannerModal.style.display = 'flex';
            showTab('addItems');
        };
    }
    // Optionally, add logic to close modal when clicking outside or pressing Escape
    window.onclick = function(e) {
        if (e.target === scannerModal) {
            scannerModal.style.display = 'none';
        }
    };
    window.onkeydown = function(e) {
        if (e.key === 'Escape') {
            scannerModal.style.display = 'none';
        }
    };
});

// Checkbox auto-check/uncheck logic for manual SKU/Barcode
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        var skuInput = document.getElementById('manualSKU');
        var skuCheckbox = document.getElementById('enableSKU');
        var barcodeInput = document.getElementById('manualBarcode');
        var barcodeCheckbox = document.getElementById('enableBarcode');

        // Guard flag to prevent blur logic when clicking checkbox
        var skuBlurByCheckbox = false;
        var barcodeBlurByCheckbox = false;

        if (skuInput && skuCheckbox) {
            skuCheckbox.addEventListener('mousedown', function() {
                skuBlurByCheckbox = true;
            });
            skuInput.addEventListener('focus', function() {
                skuCheckbox.checked = true;
            });
            skuInput.addEventListener('blur', function() {
                if (skuBlurByCheckbox) {
                    skuBlurByCheckbox = false;
                    return; // Don't uncheck if blur caused by checkbox click
                }
                if (!skuInput.value.trim()) {
                    skuCheckbox.checked = false;
                } else {
                    skuCheckbox.checked = true;
                }
            });
            skuInput.addEventListener('input', function() {
                if (skuInput.value.trim()) {
                    skuCheckbox.checked = true;
                }
            });
        }
        if (barcodeInput && barcodeCheckbox) {
            barcodeCheckbox.addEventListener('mousedown', function() {
                barcodeBlurByCheckbox = true;
            });
            barcodeInput.addEventListener('focus', function() {
                barcodeCheckbox.checked = true;
            });
            barcodeInput.addEventListener('blur', function() {
                if (barcodeBlurByCheckbox) {
                    barcodeBlurByCheckbox = false;
                    return;
                }
                if (!barcodeInput.value.trim()) {
                    barcodeCheckbox.checked = false;
                } else {
                    barcodeCheckbox.checked = true;
                }
            });
            barcodeInput.addEventListener('input', function() {
                if (barcodeInput.value.trim()) {
                    barcodeCheckbox.checked = true;
                }
            });
        }
    });
})();



// --- TAB PANEL LOGIC FOR MODAL ---
// Tab names: 'scan', 'manual', 'addItems'
let currentTab = 'scan';
let previousTab = 'scan';

// Helper: always show the correct tab panel with transitions
function showTab(tabName, transition = true) {
    const scanPanel = document.getElementById('scanTabPanel');
    const manualPanel = document.getElementById('manualTabPanel');
    const addItemsPanel = document.getElementById('addItemsTabPanel');
    // Hide all panels, but if opening addItems, animate previous panel out first, then animate addItems in
    if (tabName === 'addItems') {
        const prevPanel = { scan: scanPanel, manual: manualPanel }[previousTab];
        const modalContent = document.querySelector('.modal-content.scanner-modal');
        if (addItemsPanel) {
            // Make sure addItemsPanel is rendered for sizing
            addItemsPanel.style.display = 'block';
            // Temporarily set width to 'auto' to measure natural content width
            const prevWidth = addItemsPanel.style.width;
            addItemsPanel.style.width = 'auto';
            // Measure new panel height and natural width
            const newHeight = addItemsPanel.offsetHeight;
            const newWidth = addItemsPanel.scrollWidth;
            // Restore panel width
            addItemsPanel.style.width = prevWidth || '';
            // Set modal container height and width to new panel size before transition
            if (modalContent) {
                modalContent.style.height = newHeight + 'px';
                modalContent.style.width = newWidth + 'px';
            }
            // Start transition
            addItemsPanel.classList.add('slide-in');
            addItemsPanel.classList.add('active');
            if (prevPanel) {
                prevPanel.classList.add('slide-out-left');
                prevPanel.classList.remove('slide-in');
                prevPanel.classList.add('active');
                prevPanel.style.display = 'block';
            }
            // After animation, hide previous panel and reset Add Items position and modal size
            setTimeout(() => {
                if (prevPanel) {
                    prevPanel.classList.remove('active', 'slide-out-left');
                    prevPanel.style.display = 'none';
                }
                addItemsPanel.classList.remove('slide-in');
                addItemsPanel.style.position = 'relative';
                if (modalContent) {
                    modalContent.style.height = '';
                    modalContent.style.width = '';
                }
            }, 250);
        }
        // Hide tab buttons
        var modalTabs = document.querySelector('.modal-tabs');
        var scanTabBtn = document.getElementById('scanTab');
        var manualTabBtn = document.getElementById('manualTab');
        if (modalTabs) modalTabs.style.display = 'none';
        if (scanTabBtn) scanTabBtn.classList.remove('active');
        if (manualTabBtn) manualTabBtn.classList.remove('active');
    } else if (currentTab === 'addItems') {
        // Reverse transition: going back from Add Items to scan/manual
        const prevPanel = { scan: scanPanel, manual: manualPanel }[tabName];
        const modalContent = document.querySelector('.modal-content.scanner-modal');
        const modalTabs = document.querySelector('.modal-tabs');
        if (addItemsPanel && prevPanel) {
            // Make sure previous panel is rendered for sizing
            prevPanel.style.display = 'block';
            prevPanel.style.width = 'auto';
            const newHeight = prevPanel.offsetHeight;
            const newWidth = prevPanel.scrollWidth;
            prevPanel.style.width = '';
            if (modalContent) {
                modalContent.style.height = newHeight + 'px';
                modalContent.style.width = newWidth + 'px';
            }
            // Animate Add Items out right, previous panel in left
            addItemsPanel.classList.add('slide-out-right');
            addItemsPanel.classList.remove('slide-in');
            addItemsPanel.classList.add('active');
            prevPanel.classList.add('slide-in-left');
            prevPanel.classList.add('active');
            prevPanel.style.display = 'block';
            // Animate tab buttons in with content
            if (modalTabs) {
                modalTabs.classList.add('slide-in-left');
                modalTabs.classList.remove('slide-out-right');
                modalTabs.style.display = 'flex';
            }
            // After animation, hide Add Items panel and reset modal size/tab buttons
            setTimeout(() => {
                addItemsPanel.classList.remove('active', 'slide-out-right');
                addItemsPanel.style.display = 'none';
                prevPanel.classList.remove('slide-in-left');
                prevPanel.style.position = 'relative';
                if (modalContent) {
                    modalContent.style.height = '';
                    modalContent.style.width = '';
                }
                if (modalTabs) {
                    modalTabs.classList.remove('slide-in-left');
                }
            }, 250);
        }
        // Show tab buttons
        var scanTabBtn = document.getElementById('scanTab');
        var manualTabBtn = document.getElementById('manualTab');
        if (modalTabs) modalTabs.style.display = 'flex';
        if (scanTabBtn) scanTabBtn.classList.toggle('active', tabName === 'scan');
        if (manualTabBtn) manualTabBtn.classList.toggle('active', tabName === 'manual');
    } else {
        // Hide all panels instantly
        [scanPanel, manualPanel, addItemsPanel].forEach(panel => {
            if (panel) {
                panel.style.display = 'none';
                panel.classList.remove('active', 'slide-in', 'slide-out-left');
                panel.style.position = 'absolute';
            }
        });
        // Show/hide tab buttons
        var modalTabs = document.querySelector('.modal-tabs');
        var scanTabBtn = document.getElementById('scanTab');
        var manualTabBtn = document.getElementById('manualTab');
        if (modalTabs) modalTabs.style.display = 'flex';
        if (scanTabBtn) scanTabBtn.classList.toggle('active', tabName === 'scan');
        if (manualTabBtn) manualTabBtn.classList.toggle('active', tabName === 'manual');
        // Show the requested panel
        const activePanel = {
            scan: scanPanel,
            manual: manualPanel,
            addItems: addItemsPanel
        }[tabName];
        if (activePanel) {
            activePanel.style.display = 'block';
            activePanel.classList.add('active');
            activePanel.style.position = 'relative';
        }
    }
    // Show/hide tab buttons
    var modalTabs = document.querySelector('.modal-tabs');
    var scanTabBtn = document.getElementById('scanTab');
    var manualTabBtn = document.getElementById('manualTab');
    if (tabName === 'addItems') {
        if (modalTabs) modalTabs.style.display = 'none';
        if (scanTabBtn) scanTabBtn.classList.remove('active');
        if (manualTabBtn) manualTabBtn.classList.remove('active');
    } else {
        if (modalTabs) modalTabs.style.display = 'flex';
        if (scanTabBtn) scanTabBtn.classList.toggle('active', tabName === 'scan');
        if (manualTabBtn) manualTabBtn.classList.toggle('active', tabName === 'manual');
    }
    // Show the requested panel (normal case)
    if (!(currentTab === 'addItems' && tabName !== 'addItems')) {
        const activePanel = {
            scan: scanPanel,
            manual: manualPanel,
            addItems: addItemsPanel
        }[tabName];
        if (activePanel) {
            activePanel.style.display = 'flex';
            activePanel.classList.add('active');
            // Only animate when opening addItems
            if (tabName === 'addItems') {
                activePanel.classList.add('slide-in');
                setTimeout(() => activePanel.classList.remove('slide-in'), 400);
            }
        }
    }
    // Track previous tab for back/cancel
    if (tabName !== 'addItems') {
        previousTab = tabName;
    }
    currentTab = tabName;
}

document.addEventListener('DOMContentLoaded', function () {
    // Tab buttons
    const scanTabBtn = document.getElementById('scanTab');
    const manualTabBtn = document.getElementById('manualTab');
    // Panels
    const scanPanel = document.getElementById('scanTabPanel');
    const manualPanel = document.getElementById('manualTabPanel');
    const addItemsPanel = document.getElementById('addItemsTabPanel');
    // Add Items triggers
    const skipScannerBtn = document.getElementById('skipScanner');
    const skipManualEntryBtn = document.getElementById('skipManualEntry');
    // Add Items panel buttons
    function attachAddItemsPanelListeners() {
        if (!addItemsPanel) return;
        // Back button
        const backBtn = addItemsPanel.querySelector('#backInlineAddItems');
        if (backBtn) backBtn.onclick = () => showTab(previousTab);
        // Cancel button
        const cancelBtn = addItemsPanel.querySelector('.cancel-secondary');
        if (cancelBtn) cancelBtn.onclick = () => showTab(previousTab);
        // Add button (form submit)
        const addBtn = addItemsPanel.querySelector('.btn.btn-primary');
        const form = addItemsPanel.querySelector('#inlineAddItemsForm');
        if (addBtn && form) {
            addBtn.onclick = function(e) {
                e.preventDefault();
                form.requestSubmit();
            };
        }
        // Form submit
        if (form) {
            form.onsubmit = function(e) {
                e.preventDefault();
                // Collect form data here
                showTab(previousTab);
                return false;
            };
        }
    }
    // Tab switching
    if (scanTabBtn) scanTabBtn.onclick = () => showTab('scan', false);
    if (manualTabBtn) manualTabBtn.onclick = () => showTab('manual', false);
    // Add Items triggers
    if (skipScannerBtn) skipScannerBtn.onclick = () => {
        showTab('addItems', true);
        attachAddItemsPanelListeners();
    };
    if (skipManualEntryBtn) skipManualEntryBtn.onclick = () => {
        showTab('addItems', true);
        attachAddItemsPanelListeners();
    };
    // Initial tab
    showTab('scan', false);
});