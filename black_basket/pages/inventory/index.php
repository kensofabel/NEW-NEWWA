<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: /black_basket/index.php');
    exit();
}
?>

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
    <style>
        /* Disable tab content when not active */
        .pos-tab-panel[aria-disabled="true"] {
            pointer-events: none;
            opacity: 0.5;
            filter: grayscale(0.5);
        }
        /* Slide-up effect for POS options above form, never covering footer */
                #posOptionsContainer {
          position: absolute;
          left: 0;
          right: 0;
          /* Align bottom to top of footer */
          bottom: 100%;
          background: #171717;
          border-radius: 20px 20px 0 0;
          box-shadow: 0 -4px 0 #414141;
          z-index: 20; /* Lower than footer */
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(.4,0,.2,1), padding 0.4s cubic-bezier(.4,0,.2,1);
          padding: 0 20px;
          pointer-events: none;
        }
        
        .product-form.pos-options-active, 
        .product-form.pos-options-active * {
            pointer-events: none !important;
            opacity: 0.6;
        }
        #posOptionsContainer.slide-up {
          max-height: 420px;
          padding: 20px 20px 0 20px;
          overflow: none;
          pointer-events: auto;
          z-index: 20; /* Lower than footer */
        }
        .modal-footer {
          position: sticky !important;
          bottom: 0 !important;
          z-index: 30 !important; /* Always above POS options */
          background: #171717 !important;
        }

        /* Ensure modal body is relative for absolute positioning */
        .inventory-modal-body, .modal-content, .modal-dialog {
          position: relative;
        }

        #posToggleChevron {
          display: none;
        }
        #availablePOS:checked ~ label ~ #posToggleChevron {
          display: inline-block;
        }
    </style>
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
                        <div class="form-group checkbox-group">
                            <label>SKU</label>
                            <div class="input-row">
                                <input type="checkbox" id="enableSKU" class="field-checkbox">
                                <input type="text" id="manualSKU" required class="input-box" placeholder="Unique item identifier">
                            </div>
                        </div>
                        <div class="form-group checkbox-group">
                            <label>Barcode</label>
                            <div class="input-row">
                                <input type="checkbox" id="enableBarcode" class="field-checkbox">
                                <input type="text" id="manualBarcode" required class="input-box" placeholder="Barcode number">
                            </div>
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
                            <div class="form-group name-autocomplete" style="flex:3; position: relative;">
                                <label for="inlineItemName">Name</label>
                                <input type="text" id="inlineItemName" name="itemName" required class="input-box" autocomplete="off">
                                <div class="name-dropdown" id="nameDropdown"></div>
                            </div>
                            <div class="form-group category-autocomplete" style="flex:2; position: relative;">
                                <label for="inlineItemCategory">Category</label>
                                <input type="text" id="inlineItemCategory" name="itemCategory" required class="input-box" autocomplete="off" placeholder="Select or create">
                                <div class="category-dropdown" id="categoryDropdown"></div>
                            </div>
                        </div>
                        <!-- Row 2: Price | Cost | Track Stock Toggle -->
                        <div class="form-row" id="priceRow" style="display: flex; gap: 15px; justify-content: space-between; margin-top: 10px; margin-bottom: -10px;">
                            <div class="form-group" style="flex:1.45;">
                                <label for="inlineItemPrice">Price</label>
                                <input type="text" id="inlineItemPrice" name="itemPrice" required class="input-box" currency-localization="₱" placeholder="Optional">
                            </div>
                            <div class="form-group" style="flex:1.45;">
                                <label for="inlineItemCost">Cost</label>
                                <input type="text" id="inlineItemCost" name="itemCost" required class="input-box" currency-localization="₱" value="₱0.00">
                            </div>
                            <div class="form-group" style="flex:2;">
                                <label for="inlineTrackStockToggle">Track Stock</label>
                                <label class="switch" style="left: 10px;">
                                    <input type="checkbox" id="inlineTrackStockToggle" name="trackStock">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>

                        <!-- Variants Section (Initially Hidden) -->
                        <div class="variants-section" id="variantsSection" style="display: none; margin-top: 10px; margin-bottom: -10px;">
                            <div class="modal-divider" style="margin-top: -10px !important; margin-bottom: 20px !important;"></div>
                            <!-- Variants Header -->
                            <div class="variants-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <button type="button" class="variants-add-btn" style="background: #ff9800; color: white; border: none; padding: 8px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">+ Add Variant</button>
                                <div style="display: flex; gap: 10px; align-items: center;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <label style="color: #dbdbdb; font-size: 12px; margin: 0;">Track Stock</label>
                                        <label class="switch" style="width: 60px !important; height: 30px !important;">
                                            <input type="checkbox" id="variantsTrackStockToggle" name="variantsTrackStock">
                                            <span class="slider" style="top: -1px; bottom: 1px;"></span>
                                        </label>
                                    </div>
                                    <button type="button" class="variants-close-btn" id="closeVariantsBtn" style="background: #dc3545; color: white; border: none; padding: 8px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; transition: all 0.2s ease;">
                                        ✕ Close
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Variants Table -->
                            <div class="variants-table-container" style="border: 2px solid #444; border-radius: 8px; background: #1a1a1a;">
                                <table class="variants-table" style="width: 100%; border-collapse: collapse;">
                                    <thead id="variantsTableHead">
                                        <tr style="background: #333;">
                                            <th style="padding: 12px 8px; color: #dbdbdb; border-bottom: 1px solid #555; text-align: center; font-size: 11px;">Available</th>
                                            <th style="padding: 12px 8px; color: #dbdbdb; border-bottom: 1px solid #555; text-align: left; font-size: 11px;">Variant</th>
                                            <th style="padding: 12px 8px; color: #dbdbdb; border-bottom: 1px solid #555; text-align: left; font-size: 11px;">Price</th>
                                            <th style="padding: 12px 8px; color: #dbdbdb; border-bottom: 1px solid #555; text-align: left; font-size: 11px;">Cost</th>
                                            <th class="stock-column" style="padding: 12px 8px; color: #dbdbdb; border-bottom: 1px solid #555; text-align: left; font-size: 11px; display: none;">In Stock</th>
                                            <th class="stock-column" style="padding: 12px 8px; color: #dbdbdb; border-bottom: 1px solid #555; text-align: left; font-size: 11px; display: none;">Low Stock</th>
                                            <th style="padding: 12px 8px; color: #dbdbdb; border-bottom: 1px solid #555; text-align: left; font-size: 11px;">SKU</th>
                                            <th style="padding: 12px 8px; color: #dbdbdb; border-bottom: 1px solid #555; text-align: left; font-size: 11px;">Barcode</th>
                                            <th style="padding: 12px 8px; color: #dbdbdb; border-bottom: 1px solid #555; text-align: center; font-size: 11px; width: 50px;">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody id="variantsTableBody">
                                        <!-- Variant rows will be added here dynamically -->
                                    </tbody>
                                </table>
                            </div>
                            <div class="modal-divider" style="margin-bottom: 30px !important; margin-top: 20px !important;"></div>
                        </div>
                        <div class="form-row stock-fields" id="stockFieldsRow" style="display: none; gap: 15px; justify-content: space-between;">
                            <div class="form-group quantity-input-wrapper" style="flex:2;">
                                <label for="inlineInStock">In Stock</label>
                                <div class="input-with-unit-selector">
                                    <input type="text" id="inlineInStock" name="inStock" class="input-box" placeholder="Stock quantity">
                                    <div class="unit-selector">
                                        <span class="unit-prefix">|</span>
                                        <span class="unit-value">- -</span>
                                        <div class="unit-arrows">
                                            <button type="button" class="unit-arrow unit-up">▲</button>
                                            <button type="button" class="unit-arrow unit-down">▼</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group quantity-input-wrapper" style="flex:2; margin-right: 95px;">
                                <label for="inlineLowStock">Low stock</label>
                                <div class="input-with-unit-selector">
                                    <input type="text" id="inlineLowStock" name="lowStock" class="input-box" placeholder="Alert stock">
                                    <div class="unit-selector">
                                        <span class="unit-prefix">|</span>
                                        <span class="unit-value">- -</span>
                                        <div class="unit-arrows">
                                            <button type="button" class="unit-arrow unit-up">▲</button>
                                            <button type="button" class="unit-arrow unit-down">▼</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form-row" style="display: flex; gap: 15px; justify-content: space-between; margin-bottom: -20px">
                            <div class="form-group" style="flex:2;">
                                <label for="inlineItemSKU">SKU</label>
                                <input type="text" id="inlineItemSKU" name="itemSKU" required class="input-box" placeholder="Unique item identifier">
                            </div>
                            <div class="form-group" style="flex:2;">
                                <label for="inlineItemBarcode">Barcode</label>
                                <input type="text" id="inlineItemBarcode" name="itemBarcode" required class="input-box">
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer" style="position: sticky; bottom: 0; z-index: 10; padding: 10px 20px;">
                    <div style="display: flex; flex-direction: column; width: 100%; gap: 8px;">
                        <div class="modal-divider" style="z-index: 30;"></div>
                        <!-- First row: Checkbox -->
                        <div style="display: flex; align-items: center; justify-content: flex-start; width: 100%;">
                          <div class="form-group" style="display: flex; align-items: center; gap: 30px; position: relative;">
                            <input type="checkbox" id="availablePOS" name="availablePOS" class="field-checkbox">
                            <label for="availablePOS" style="cursor: pointer;">This item is available in POS</label>
                          </div>
                          <span id="posToggleChevron" style="font-size: 18px; cursor: pointer; user-select: none; transition: transform 0.3s; color: #fff; display: none; margin-left: auto; align-self: flex-start;">
                            <svg id="chevronSVG" width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;">
                              <path id="chevronPath" fill-rule="evenodd" clip-rule="evenodd" d="M4.18179 8.81819C4.00605 8.64245 4.00605 8.35753 4.18179 8.18179L7.18179 5.18179C7.26618 5.0974 7.38064 5.04999 7.49999 5.04999C7.61933 5.04999 7.73379 5.0974 7.81819 5.18179L10.8182 8.18179C10.9939 8.35753 10.9939 8.64245 10.8182 8.81819C10.6424 8.99392 10.3575 8.99392 10.1818 8.81819L7.49999 6.13638L4.81819 8.81819C4.64245 8.99392 4.35753 8.99392 4.18179 8.81819Z" fill="#fff"/>
                            </svg>
                          </span>
                        </div>
                        
                        <!-- POS Options Tabs (hidden by default) -->
                        <div id="posOptionsContainer" style="display: none; width: 100%; margin-top: 10px;">
                            
                            
                            <!-- Tab Content -->
                            <div class="pos-tab-content">
                                <!-- Color & Shape Tab -->
                                <div id="colorShapeTab" class="pos-tab-panel active" style="display: block;">
                                    <div style="display: flex; gap: 15px;">
                                        <!-- Color Selection -->
                                        <div style="flex: 1; text-align: center;">
                                            <label style="display: block; color: #dbdbdb; font-size: 12px; margin-bottom: 10px;">Color</label>
                                            <div class="color-options" style="display: flex; flex-wrap: wrap; gap: 5px; justify-content: center;">
                                                <div class="color-option" data-color="red" style="width: 24px; height: 24px; background: #f44336; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: all 0.2s ease;"></div>
                                                <div class="color-option" data-color="orange" style="width: 24px; height: 24px; background: #ff9800; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: all 0.2s ease;"></div>
                                                <div class="color-option" data-color="yellow" style="width: 24px; height: 24px; background: #ffeb3b; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: all 0.2s ease;"></div>
                                                <div class="color-option" data-color="green" style="width: 24px; height: 24px; background: #4caf50; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: all 0.2s ease;"></div>
                                                <div class="color-option" data-color="blue" style="width: 24px; height: 24px; background: #2196f3; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: all 0.2s ease;"></div>
                                                <div class="color-option" data-color="purple" style="width: 24px; height: 24px; background: #9c27b0; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: all 0.2s ease;"></div>
                                                <div class="color-option" data-color="brown" style="width: 24px; height: 24px; background: #795548; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: all 0.2s ease;"></div>
                                                <div class="color-option" data-color="gray" style="width: 24px; height: 24px; background: #607d8b; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: all 0.2s ease;"></div>
                                            </div>
                                        </div>
                                        
                                        <!-- Shape Selection -->
                                        <div style="flex: 1; text-align: center; margin-bottom: 20px;">
                                            <label style="display: block; color: #dbdbdb; font-size: 12px; margin-bottom: 10px;">Shape</label>
                                            <div class="shape-options" style="display: flex; flex-wrap: wrap; gap: 5px; justify-content: center;">
                                                <div class="shape-option" data-shape="circle" style="width: 24px; height: 24px; background: #555; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: all 0.2s ease;"></div>
                                                <div class="shape-option" data-shape="square" style="width: 24px; height: 24px; background: #555; border-radius: 2px; cursor: pointer; border: 2px solid transparent; transition: all 0.2s ease;"></div>
                                                <div class="shape-option" data-shape="triangle" style="width: 0; height: 0; border-left: 12px solid transparent; border-right: 12px solid transparent; border-bottom: 20px solid #555; cursor: pointer; border-radius: 0; transition: all 0.2s ease; position: relative;"></div>
                                                <div class="shape-option" data-shape="diamond" style="width: 16px; height: 16px; background: #555; cursor: pointer; border: 2px solid transparent; transition: all 0.2s ease; transform: rotate(45deg); margin: 4px;"></div>
                                                <div class="shape-option" data-shape="star" style="width: 20px; height: 20px; background: #555; cursor: pointer; border: 2px solid transparent; transition: all 0.2s ease; clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);"></div>
                                                <div class="shape-option" data-shape="hexagon" style="width: 20px; height: 20px; background: #555; cursor: pointer; border: 2px solid transparent; transition: all 0.2s ease; clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Image Tab -->
                                <div id="imageTab" class="pos-tab-panel" style="display: none;">
                                    <div style="text-align: center;">
                                        <label style="display: block; color: #dbdbdb; font-size: 12px; margin-bottom: 10px;">Product Image</label>
                                        <div class="image-upload-area" style="border: 2px dashed #555; border-radius: 8px; padding: 20px; cursor: pointer; transition: all 0.2s ease; background: #1a1a1a; margin-bottom: 20px;">
                                            <input type="file" id="posProductImage" accept="image/*" style="display: none;">
                                            <div class="upload-placeholder" id="imageUploadPlaceholder">
                                                <i class="fas fa-cloud-upload-alt" style="font-size: 32px; color: #777; margin-bottom: 8px;"></i>
                                                <p style="color: #777; font-size: 12px; margin: 0;">Click to upload product image</p>
                                                <p style="color: #555; font-size: 10px; margin: 4px 0 0 0;">JPG, PNG, GIF up to 10MB</p>
                                            </div>
                                            <div id="imageCropBoxContainer" style="display:none; justify-content:center; align-items:center; margin-top:5px;">
                                                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%;">
                                                    <div style="display:flex; flex-direction:row; align-items:flex-start; justify-content:center; width:100%;">
                                                        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; width:150px; margin-left: 32px; flex:0 0 auto;">
                                                            <div id="cropBoxWrapper" style="width:150px; height:150px; background:#222; border:2px solid #ff9800; border-radius:8px; overflow:hidden; position:relative; display:flex; align-items:center; justify-content:center;">
                                                                <img id="imageCropPreview" src="" style="position:absolute; left:0; top:0; width:100%; height:100%; object-fit:cover; object-position:center center; transition:transform 0.2s, object-position 0.2s;" draggable="false">
                                                            </div>
                                                        </div>
                                                        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; margin-top: 20px; flex:0 0 auto;">
                                                            <input type="range" id="zoomSlider" min="1" max="3" step="0.01" value="1" style="writing-mode: bt-lr; -webkit-appearance: slider-vertical; appearance: slider-vertical; width:32px; height:120px; margin-top: 0;">
                                                        </div>
                                                    </div>
                                                    <div style="margin-top:16px; display:flex; flex-direction:row; gap:10px; align-items:center; justify-content:center; width:100%;">
                                                        <button type="button" id="moveLeftBtn" style="background:#333; color:#fff; border:none; border-radius:4px; width:32px; height:32px; font-size:18px; cursor:pointer;">&#8592;</button>
                                                        <button type="button" id="moveUpBtn" style="background:#333; color:#fff; border:none; border-radius:4px; width:32px; height:32px; font-size:18px; cursor:pointer;">&#8593;</button>
                                                        <button type="button" id="moveDownBtn" style="background:#333; color:#fff; border:none; border-radius:4px; width:32px; height:32px; font-size:18px; cursor:pointer;">&#8595;</button>
                                                        <button type="button" id="moveRightBtn" style="background:#333; color:#fff; border:none; border-radius:4px; width:32px; height:32px; font-size:18px; cursor:pointer;">&#8594;</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Tab Navigation -->
                            <div class="pos-tabs" style="display: flex; gap: 2px; margin-bottom: 10px;">
                                <button type="button" class="pos-tab-btn active" data-tab="colorShape" style="flex: 1; padding: 8px 12px; background: #ff9800; color: #171717; border: none; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">
                                    Color & Shape
                                </button>
                                <button type="button" class="pos-tab-btn" data-tab="image" style="flex: 1; padding: 8px 12px; background: #333; color: #dbdbdb; border: none; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">
                                    Image
                                </button>
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

// --- Product Image Crop Box Logic ---
document.addEventListener('DOMContentLoaded', function() {
    // --- Updated selectors and event logic for new DOM structure ---
    var fileInput = document.getElementById('posProductImage');
    var uploadArea = document.querySelector('.image-upload-area');
    var cropBoxWrapper = document.getElementById('cropBoxWrapper');
    var placeholder = document.getElementById('imageUploadPlaceholder');
    var cropBoxContainer = document.getElementById('imageCropBoxContainer');
    var cropPreview = document.getElementById('imageCropPreview');
    // Buttons and slider now outside cropBoxWrapper
    var moveLeftBtn = document.getElementById('moveLeftBtn');
    var moveRightBtn = document.getElementById('moveRightBtn');
    var moveUpBtn = document.getElementById('moveUpBtn');
    var moveDownBtn = document.getElementById('moveDownBtn');
    var zoomSlider = document.getElementById('zoomSlider');
    // State
    var imgLoaded = false;
    var posX = 50   ; // percent
    var posY = 50; // percent
    var zoom = 1;
    var uploadEnabled = true;
    var fileDialogOpen = false;

    function triggerFileDialog(e) {
        if (uploadEnabled && !fileDialogOpen) {
            fileDialogOpen = true;
            setTimeout(function() { fileInput.click(); }, 0);
            if (e) e.stopImmediatePropagation();
        }
    }
    // Initial: only upload area is clickable
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', triggerFileDialog);
    }
    function removeUploadAreaClick() {
        if (uploadArea) {
            uploadArea.removeEventListener('click', triggerFileDialog);
            uploadArea.style.pointerEvents = 'none';
        }
    }
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            fileDialogOpen = false;
            var file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                var reader = new FileReader();
                reader.onload = function(evt) {
                    // Reset crop state for new image
                    posX = 50;
                    posY = 50;
                    zoom = 1;
                    cropPreview = document.getElementById('imageCropPreview');
                    cropPreview.src = evt.target.result;
                    cropPreview.style.objectPosition = posX + '% ' + posY + '%';
                    cropPreview.style.transform = 'scale(' + zoom + ')';
                    placeholder.style.display = 'none';
                    cropBoxContainer = document.getElementById('imageCropBoxContainer');
                    cropBoxContainer.style.display = 'flex';
                    imgLoaded = true;
                    // Remove click from uploadArea, add to cropBoxWrapper
                    removeUploadAreaClick();
                    uploadArea.style.cursor = 'default';
                    uploadArea.style.pointerEvents = 'none';
                    cropBoxWrapper = document.getElementById('cropBoxWrapper');
                    // Remove previous listeners to avoid duplicates
                    if (cropBoxWrapper) {
                        cropBoxWrapper.style.pointerEvents = 'auto';
                        cropBoxWrapper.style.cursor = 'pointer';
                        cropBoxWrapper.removeEventListener('click', triggerFileDialog);
                        cropBoxWrapper.addEventListener('click', function(ev) {
                            // Only trigger file dialog if not clicking the image itself or the zoom slider
                            var zoomSlider = document.getElementById('zoomSlider');
                            if (ev.target === cropBoxWrapper) {
                                triggerFileDialog(ev);
                            }
                        });
                        // Prevent zoomSlider from bubbling events to cropBoxWrapper
                        var zoomSlider = document.getElementById('zoomSlider');
                        if (zoomSlider) {
                            zoomSlider.addEventListener('mousedown', function(e) { e.stopPropagation(); }, true);
                            zoomSlider.addEventListener('click', function(e) { e.stopPropagation(); }, true);
                            // Do NOT stop propagation for input event, let it update zoom
                        }
                    }
                    // Ensure crop controls are always clickable
                    var moveLeftBtn = document.getElementById('moveLeftBtn');
                    var moveRightBtn = document.getElementById('moveRightBtn');
                    var moveUpBtn = document.getElementById('moveUpBtn');
                    var moveDownBtn = document.getElementById('moveDownBtn');
                    if (moveLeftBtn) moveLeftBtn.style.pointerEvents = 'auto';
                    if (moveRightBtn) moveRightBtn.style.pointerEvents = 'auto';
                    if (moveUpBtn) moveUpBtn.style.pointerEvents = 'auto';
                    if (moveDownBtn) moveDownBtn.style.pointerEvents = 'auto';
                    if (zoomSlider) zoomSlider.style.pointerEvents = 'auto';
                };
                reader.readAsDataURL(file);
            }
        });
    }
    function updateCrop() {
        cropPreview = document.getElementById('imageCropPreview');
        if (cropPreview) {
            cropPreview.style.objectPosition = posX + '% ' + posY + '%';
            cropPreview.style.transform = 'scale(' + zoom + ')';
            if (zoom > 1) {
                cropPreview.style.objectFit = 'none';
            } else {
                cropPreview.style.objectFit = 'cover';
            }
        }
    }
    // Attach crop controls listeners (always re-attach after image upload)
    function attachCropControls() {
        moveLeftBtn = document.getElementById('moveLeftBtn');
        moveRightBtn = document.getElementById('moveRightBtn');
        moveUpBtn = document.getElementById('moveUpBtn');
        moveDownBtn = document.getElementById('moveDownBtn');
        zoomSlider = document.getElementById('zoomSlider');

        function getCropPreview() {
            return document.getElementById('imageCropPreview');
        }

        if (moveLeftBtn) {
            moveLeftBtn.onclick = function(e) {
                e.stopPropagation();
                if (!imgLoaded) { console.log('Left: img not loaded'); return; }
                posX = Math.max(0, posX - 2);
                cropPreview = getCropPreview();
                updateCrop();
                console.log('Left btn', posX, posY, zoom);
            };
        }
        if (moveRightBtn) {
            moveRightBtn.onclick = function(e) {
                e.stopPropagation();
                if (!imgLoaded) { console.log('Right: img not loaded'); return; }
                posX = Math.min(100, posX + 2);
                cropPreview = getCropPreview();
                updateCrop();
                console.log('Right btn', posX, posY, zoom);
            };
        }
        if (moveUpBtn) {
            moveUpBtn.onclick = function(e) {
                e.stopPropagation();
                if (!imgLoaded) { console.log('Up: img not loaded'); return; }
                posY = Math.max(0, posY - 2);
                cropPreview = getCropPreview();
                updateCrop();
                console.log('Up btn', posX, posY, zoom);
            };
        }
        if (moveDownBtn) {
            moveDownBtn.onclick = function(e) {
                e.stopPropagation();
                if (!imgLoaded) { console.log('Down: img not loaded'); return; }
                posY = Math.min(100, posY + 2);
                cropPreview = getCropPreview();
                updateCrop();
                console.log('Down btn', posX, posY, zoom);
            };
        }
        if (zoomSlider) {
            zoomSlider.oninput = function(e) {
                e.stopPropagation();
                if (!imgLoaded) { console.log('Zoom: img not loaded'); return; }
                zoom = parseFloat(zoomSlider.value);
                cropPreview = getCropPreview();
                updateCrop();
                console.log('Zoom slider', posX, posY, zoom);
            };
        }
    }
    attachCropControls();

    // After image upload, re-attach crop controls
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            setTimeout(attachCropControls, 50);
        });
    }
});
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

// Input validation for Next button is now handled in inventory.js

document.addEventListener('DOMContentLoaded', function() {
    var posCheckbox = document.getElementById('availablePOS');
    var posOptions = document.getElementById('posOptionsContainer');
    var posChevron = document.getElementById('posToggleChevron');
    var chevronPath = document.getElementById('chevronPath');
    var modalFooter = document.querySelector('.modal-footer');
    var productForm = document.querySelector('.product-form');
    function updateChevronVisibility() {
        if (posCheckbox.checked) {
            posChevron.style.display = 'inline-block';
        } else {
            posChevron.style.display = 'none';
        }
    }
    if (posCheckbox && posOptions && posChevron && chevronPath) {
        function updateChevron() {
            if (posOptions.classList.contains('slide-up')) {
                chevronPath.setAttribute('d', 'M4.18179 8.81819C4.00605 8.64245 4.00605 8.35753 4.18179 8.18179L7.18179 5.18179C7.26618 5.0974 7.38064 5.04999 7.49999 5.04999C7.61933 5.04999 7.73379 5.0974 7.81819 5.18179L10.8182 8.18179C10.9939 8.35753 10.9939 8.64245 10.8182 8.81819C10.6424 8.99392 10.3575 8.99392 10.1818 8.81819L7.49999 6.13638L4.81819 8.81819C4.64245 8.99392 4.35753 8.99392 4.18179 8.81819Z');
            } else {
                chevronPath.setAttribute('d', 'M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6424 6.00608 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61934 9.95001 7.49999 9.95001C7.38064 9.95001 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z');
            }
        }
        posCheckbox.addEventListener('change', function() {
            updateChevronVisibility();
            if (this.checked) {
                posOptions.style.display = 'block';
                setTimeout(function() {
                    posOptions.classList.add('slide-up');
                    updateChevron();
                    if (productForm) productForm.classList.add('pos-options-active');
                }, 10);
            } else {
                posOptions.classList.remove('slide-up');
                setTimeout(function() {
                    posOptions.style.display = 'none';
                    updateChevron();
                    if (productForm) productForm.classList.remove('pos-options-active');
                }, 400);
            }
        });
        posChevron.addEventListener('click', function() {
            if (!posCheckbox.checked) return;
            if (posOptions.classList.contains('slide-up')) {
                posOptions.classList.remove('slide-up');
                setTimeout(function() {
                    posOptions.style.display = 'none';
                    updateChevron();
                    if (productForm) productForm.classList.remove('pos-options-active');
                }, 400);
            } else {
                posOptions.style.display = 'block';
                setTimeout(function() {
                    posOptions.classList.add('slide-up');
                    updateChevron();
                    if (productForm) productForm.classList.add('pos-options-active');
                }, 10);
            }
        });

        updateChevronVisibility();
        updateChevron();

        // POS tab disabling logic
        var colorShapeTabBtn = document.querySelector('.pos-tab-btn[data-tab="colorShape"]');
        var imageTabBtn = document.querySelector('.pos-tab-btn[data-tab="image"]');
        var colorShapeTabPanel = document.getElementById('colorShapeTab');
        var imageTabPanel = document.getElementById('imageTab');
        function setTabDisabling() {
            if (colorShapeTabBtn && imageTabBtn && colorShapeTabPanel && imageTabPanel) {
                if (colorShapeTabBtn.classList.contains('active')) {
                    colorShapeTabPanel.setAttribute('aria-disabled', 'false');
                    imageTabPanel.setAttribute('aria-disabled', 'true');
                } else if (imageTabBtn.classList.contains('active')) {
                    colorShapeTabPanel.setAttribute('aria-disabled', 'true');
                    imageTabPanel.setAttribute('aria-disabled', 'false');
                }
            }
        }
        // Initial state
        setTabDisabling();
        // Listen for tab button clicks
        if (colorShapeTabBtn && imageTabBtn) {
            colorShapeTabBtn.addEventListener('click', function() {
                colorShapeTabBtn.classList.add('active');
                imageTabBtn.classList.remove('active');
                colorShapeTabPanel.style.display = 'block';
                imageTabPanel.style.display = 'none';
                setTabDisabling();
            });
            imageTabBtn.addEventListener('click', function() {
                imageTabBtn.classList.add('active');
                colorShapeTabBtn.classList.remove('active');
                imageTabPanel.style.display = 'block';
                colorShapeTabPanel.style.display = 'none';
                setTabDisabling();
            });
        }

        // Hide POS options when clicking outside POS options and footer
        let blockNextToggle = false;
        document.addEventListener('mousedown', function(e) {
            if (
                posCheckbox.checked &&
                posOptions.classList.contains('slide-up') &&
                !posOptions.contains(e.target) &&
                !(modalFooter && modalFooter.contains(e.target)) &&
                !(posChevron && posChevron.contains(e.target)) &&
                !(posCheckbox && posCheckbox.contains(e.target))
            ) {
                // If clicking on product form, block the next toggle
                if (productForm && productForm.contains(e.target)) {
                    blockNextToggle = true;
                    e.preventDefault();
                    e.stopPropagation();
                }
                posOptions.classList.remove('slide-up');
                setTimeout(function() {
                    posOptions.style.display = 'none';
                    updateChevron();
                    if (productForm) productForm.classList.remove('pos-options-active');
                }, 400);
            }
        });

        // Specifically block the first click on the track stock toggle after hiding POS options
        var trackStockToggle = document.getElementById('inlineTrackStockToggle');
        if (trackStockToggle) {
            trackStockToggle.addEventListener('click', function(e) {
                if (blockNextToggle) {
                    e.preventDefault();
                    e.stopPropagation();
                    blockNextToggle = false;
                }
            }, true);
        }
    }
});
</script>
<script src="inventory.js"></script>
</body>
</html>

