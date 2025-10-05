<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: /black_basket/index.php');
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inventory Management System</title>
    <link rel="stylesheet" href="../../assets/css/style.css">
    <link rel="stylesheet" href="../../assets/css/content.css">
    <link rel="stylesheet" href="inventory.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link rel="icon" type="image/x-icon" href="../../assets/images/icon.webp">
</head>
<body>
    <?php include '../../partials/navigation.php'; ?>
    <?php include '../../partials/header.php'; ?>
    <div class="content-area accounts-content-area">
        <div class="section-header">
            <h2 class="accounts-header-title">
                Inventory
                <span class="accounts-header-breadcrumb">
                    |
                    <i class="fas fa-boxes"></i>
                    - Inventory
                </span>
            </h2>
        </div>
        <div class="tabs">
            <div class="tab first-child active" id="tab-manage-inventory" onclick="showInventoryTab('manage-inventory')">Manage Inventory</div>
        </div>

        <div class="tab-info-bar">
            <span class="tab-info-text" id="tab-info-text">
                Manage your product inventory. Add new products, record waste, import/export data, and filter by categories or stock levels.
            </span>
            <div id="tab-info-actions">
                <button class="btn btn-primary" id="addProductBtn"><i class="fa fa-plus"></i> Add Item</button>
                <button class="btn btn-secondary" id="wasteBtn"><i class="fa fa-trash"></i> Record Waste</button>
                <button class="btn btn-outline" id="importBtn" title="Import"><i class="fa fa-download"></i></button>
                <button class="btn btn-outline" id="exportBtn" title="Export"><i class="fa fa-upload"></i></button>
            </div>
        </div>
                
                <!-- Filter Controls -->
                <div class="inventory-controls" id="inventoryControls" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                    <!-- Left Side: Search Controls -->
                    <div class="search-controls collapsed" id="searchControls">
                        <!-- Search Icon (visible when collapsed) -->
                        <button class="search-icon-btn" id="searchToggle">
                            <i class="fas fa-search"></i>
                        </button>
                        
                        <!-- Search Box (visible when expanded) -->
                        <div class="search-box">
                            <input type="text" id="search-inventory" placeholder="Search products...">
                            <i class="fas fa-search"></i>
                        </div>
                    </div>
                    
                    <!-- Right Side: Filter Controls -->
                    <div class="filter-controls" id="filterControls">
                        <button class="single-toggle-btn" id="itemTypeToggle" data-current="all">
                            <i class="fas fa-boxes"></i> All Items
                        </button>
                        <select id="categoryFilter">
                            <option value="">All Categories</option>
                            <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                            <option value="Dairy & Eggs">Dairy & Eggs</option>
                            <option value="Meat & Poultry">Meat & Poultry</option>
                            <option value="Bakery">Bakery</option>
                            <option value="Beverages">Beverages</option>
                            <option value="Snacks">Snacks</option>
                            <option value="Frozen Foods">Frozen Foods</option>
                            <option value="Household">Household</option>
                        </select>
                        <select id="stockAlert">
                            <option value="">All Stock</option>
                            <option value="low">Low Stock</option>
                            <option value="out">Out of Stock</option>
                            <option value="in">In Stock</option>
                        </select>
                    </div>
                </div>
                <div class="inventory-table-container">
                    <table class="inventory-table">
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Cost</th>
                                <th>Margin</th>
                                <th>Stock</th>
                            </tr>
                        </thead>
                        <tbody id="inventory-table-body">
                            <!-- Inventory data will be populated by JavaScript -->
                        </tbody>
                    </table>
                </div>
    <!-- Close main content area -->
    </div>

<!-- Scanner/Manual/Add Items Modal with Tab Panels -->
<div class="modal" id="scannerModal">
    <div class="modal-content scanner-modal">
        <div class="modal-tabs">
            <button class="scanner-tab" id="scanTab">SCAN</button>
            <button class="scanner-tab" id="manualTab">MANUAL</button>
        </div>
        <div class="tab-panels">
            <!-- Scan Tab Panel -->
            <div id="scanTabPanel" class="tab-panel">
                <div class="modal-body">
                    <div class="camera-container">
                        <video id="cameraVideo" autoplay playsinline></video>
                        <div class="scanner-overlay">
                            <div class="scanner-line"></div>
                        </div>
                    </div>
                    <div class="skip-section">
                        <button type="button" class="skip-btn" id="skipScanner">Skip for now</button>
                    </div>
                </div>
            </div>
            <!-- Manual Tab Panel -->
            <div id="manualTabPanel" class="tab-panel" style="display:none;">
                <div class="modal-body">
                    <div class="manual-form">
                        <div class="form-description">
                            <p>Enter the product's barcode or SKU to identify the item you want to add to inventory.</p>
                        </div>
                        <div class="form-group checkbox-group">
                            <input type="checkbox" id="enableSKU" class="field-checkbox">
                            <input type="text" id="manualSKU" required placeholder=" ">
                            <label for="manualSKU">SKU</label>
                        </div>
                        <div class="form-group checkbox-group">
                            <input type="checkbox" id="enableBarcode" class="field-checkbox">
                            <input type="text" id="manualBarcode" required placeholder=" ">
                            <label for="manualBarcode">Barcode</label>
                        </div>
                        <button class="btn btn-primary" id="nextBtn">Next</button>
                    </div>
                    <div class="skip-section">
                        <button type="button" class="skip-btn" id="skipManualEntry">Skip for now</button>
                    </div>
                </div>
            </div>
            <!-- Add Items/Product Tab Panel -->
            <div id="addItemsTabPanel" class="tab-panel" style="display:none;">
                <div class="modal-header">
                    <h2 class="modal-title">Add Items</h2>
                    <button type="button" class="inline-back" id="backInlineAddItems" aria-label="Back" title="Back">&larr;</button>
                </div>
                <div class="modal-divider"></div>
                <div class="modal-body">
                    <form id="inlineAddItemsForm" class="product-form">
                        <!-- Row 1: Name | Category -->
                        <div class="form-row" style="display: flex; gap: 15px; justify-content: space-between;">
                            <div class="form-group" style="flex:3;">
                                <label for="inlineItemName">Name</label>
                                <input type="text" id="inlineItemName" name="itemName" required class="input-box">
                            </div>
                            <div class="form-group" style="flex:2;">
                                <label for="inlineItemCategory">Category</label>
                                <input type="text" id="inlineItemCategory" name="itemCategory" required class="input-box" autocomplete="off">
                            </div>
                        </div>
                        <!-- Row 2: Price | Cost | Track Stock Toggle -->
                        <div class="form-row" style="display: flex; gap: 15px; justify-content: space-between;">
                            <div class="form-group" style="flex:1.45;">
                                <label for="inlineItemPrice">Price</label>
                                <input type="text" id="inlineItemPrice" name="itemPrice" required class="input-box" currency-localization="₱" placeholder="Optional">
                            </div>
                            <div class="form-group" style="flex:1.45;">
                                <label for="inlineItemCost">Cost</label>
                                <input type="text" id="inlineItemCost" name="itemCost" required class="input-box" currency-localization="₱" value="₱0.00">
                            </div>
                            <div class="form-group" style="flex:2;">
                                <label for="inline  TrackStockToggle">Track Stock</label>
                                <label class="switch" style="left: 10px;">
                                    <input type="checkbox" id="inlineTrackStockToggle" name="trackStock">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        <div class="form-row" style="display: flex; gap: 15px; justify-content: space-between; margin-top: -10px;">
                            <div class="form-group" style="flex:2;">
                                <label for="inlineItemSKU">SKU</label>
                                <input type="text" id="inlineItemSKU" name="itemSKU" required class="input-box" placeholder="Unique item identifier">
                            </div>
                            <div class="form-group" style="flex:2.5;">
                                <label for="inlineItemBarcode">Barcode</label>
                                <input type="text" id="inlineItemBarcode" name="itemBarcode" required class="input-box">
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer" style="position: sticky; bottom: 0; z-index: 10; padding: 10px 20px;">
                    <div style="display: flex; flex-direction: column; width: 100%; gap: 8px;">
                        <!-- First row: Checkbox -->
                        <div style="display: flex; align-items: center; justify-content: flex-start; width: 100%;">
                            <div class="form-group" style="display: flex; align-items: center; gap: 10px;">
                                <input type="checkbox" id="availablePOS" name="availablePOS" class="field-checkbox">
                                <label for="availablePOS">This item is available in POS</label>
                            </div>
                        </div>
                        <!-- Second row: Cancel (left) and Add (right) -->
                        <div style="display: flex; align-items: center; justify-content: flex-end; gap: 10px;">
                            <button type="button" class="cancel-secondary" style="width: 90px; height: 40px;">Cancel</button>
                            <button type="submit" class="btn btn-primary" style="width: 120px; height: 40px;">Add Item</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
function showInventoryTab(tab) {
    // For now, only one tab, but structure is ready for more
    document.getElementById('tab-manage-inventory').classList.add('active');
}

// Check if inventory has items and toggle controls/table visibility
function checkInventoryAndToggleControls() {
    const inventoryTableBody = document.getElementById('inventory-table-body');
    const inventoryControls = document.getElementById('inventoryControls');
    const inventoryTableContainer = document.querySelector('.inventory-table-container');
    const hasItems = inventoryTableBody && inventoryTableBody.children.length > 0;
    
    if (inventoryControls) {
        inventoryControls.style.display = hasItems ? 'flex' : 'none';
    }
    
    if (inventoryTableContainer) {
        inventoryTableContainer.style.display = hasItems ? 'block' : 'none';
    }
}

// Search toggle and item type toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    // (No logic for enabling/disabling manual inputs; CSS and checkbox state handle it)

    const toggleButton = document.getElementById('itemTypeToggle');
    const searchToggle = document.getElementById('searchToggle');
    const searchControls = document.getElementById('searchControls');
    const filterControls = document.getElementById('filterControls');
    const searchInput = document.getElementById('search-inventory');

    // Check inventory on page load
    checkInventoryAndToggleControls();

    // Observer to watch for changes in inventory table
    const inventoryTableBody = document.getElementById('inventory-table-body');
    if (inventoryTableBody) {
        const observer = new MutationObserver(function() {
            checkInventoryAndToggleControls();
        });
        observer.observe(inventoryTableBody, { childList: true, subtree: true });
    }

    // Search toggle functionality (only for mobile devices)
    function isMobile() {
        return window.innerWidth <= 768;
    }

    searchToggle.addEventListener('click', function() {
        if (isMobile()) {
            searchControls.classList.remove('collapsed');
            searchControls.classList.add('expanded');
            filterControls.style.display = 'none';
            setTimeout(() => {
                searchInput.focus();
            }, 100);
        }
    });

    // Click outside or press escape to collapse search (mobile only)
    document.addEventListener('click', function(e) {
        if (isMobile() && !searchControls.contains(e.target)) {
            searchControls.classList.remove('expanded');
            searchControls.classList.add('collapsed');
            filterControls.style.display = 'flex';
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (isMobile() && e.key === 'Escape') {
            searchControls.classList.remove('expanded');
            searchControls.classList.add('collapsed');
            filterControls.style.display = 'flex';
        }
    });
    
    // Reset on window resize
    window.addEventListener('resize', function() {
        if (!isMobile()) {
            searchControls.classList.remove('expanded');
            searchControls.classList.add('collapsed');
            filterControls.style.display = 'flex';
        }
    });
    
    // Single toggle button functionality
    const states = [
        { key: 'all', label: 'All Items', icon: 'fas fa-boxes' },
        { key: 'pos', label: 'POS Items', icon: 'fas fa-cash-register' },
        { key: 'stock', label: 'Stock Items', icon: 'fas fa-warehouse' }
    ];
    
    toggleButton.addEventListener('click', function() {
        const currentState = this.getAttribute('data-current');
        const currentIndex = states.findIndex(state => state.key === currentState);
        const nextIndex = (currentIndex + 1) % states.length;
        const nextState = states[nextIndex];
        
        // Update button
        this.setAttribute('data-current', nextState.key);
        this.innerHTML = `<i class="${nextState.icon}"></i> ${nextState.label}`;
        
        // Log the selected type
        console.log('Selected item type:', nextState.key);
        
        // TODO: Add filtering logic for inventory table
        // filterInventoryByType(nextState.key);
    });
});

// Disable Next button unless checked input has data
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        var skuInput = document.getElementById('manualSKU');
        var skuCheckbox = document.getElementById('enableSKU');
        var barcodeInput = document.getElementById('manualBarcode');
        var barcodeCheckbox = document.getElementById('enableBarcode');
        var nextBtn = document.getElementById('nextBtn');
        function updateNextBtn() {
            var skuValid = skuCheckbox && skuCheckbox.checked && skuInput && skuInput.value.trim();
            var barcodeValid = barcodeCheckbox && barcodeCheckbox.checked && barcodeInput && barcodeInput.value.trim();
            nextBtn.disabled = !(skuValid || barcodeValid);
        }
        if (skuInput) skuInput.addEventListener('input', updateNextBtn);
        if (barcodeInput) barcodeInput.addEventListener('input', updateNextBtn);
        if (skuCheckbox) skuCheckbox.addEventListener('change', updateNextBtn);
        if (barcodeCheckbox) barcodeCheckbox.addEventListener('change', updateNextBtn);
        updateNextBtn(); // Initial state
    });
})();

</script>
<script src="inventory.js"></script>
</body>
</html>

