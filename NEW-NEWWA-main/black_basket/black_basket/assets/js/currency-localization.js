/**
 * Loyverse-style Currency Localization
 * Automatically adds currency symbol when typing, erasable like Loyverse
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Currency localization script loaded');
    
    // Find all inputs with currency-localization attribute
    const currencyInputs = document.querySelectorAll('input[currency-localization]');
    console.log('Found currency inputs:', currencyInputs.length);
    
    // Setup existing inputs
    setupCurrencyInputs(currencyInputs);
    
    // Watch for dynamically added inputs (from templates)
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    const newCurrencyInputs = node.querySelectorAll ? node.querySelectorAll('input[currency-localization]') : [];
                    if (newCurrencyInputs.length > 0) {
                        console.log('Found new currency inputs:', newCurrencyInputs.length);
                        setupCurrencyInputs(newCurrencyInputs);
                    }
                    // Also check if the node itself is a currency input
                    if (node.hasAttribute && node.hasAttribute('currency-localization')) {
                        console.log('Added node is currency input');
                        setupCurrencyInputs([node]);
                    }
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

function setupCurrencyInputs(inputs) {
    inputs.forEach(input => {
        console.log('Setting up currency input:', input.id, 'Currency:', input.getAttribute('currency-localization'));
        const currency = input.getAttribute('currency-localization');
        
        // Handle input - add currency when typing
        input.addEventListener('input', function(e) {
            console.log('Input event triggered, value:', e.target.value);
            let value = e.target.value;
            
            // If value starts with currency, extract the numeric part
            if (value.startsWith(currency)) {
                value = value.substring(currency.length);
            }
            
            // Remove any currency symbols that might be elsewhere
            value = value.replace(new RegExp(currency.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
            
            // Remove all non-numeric characters except decimal point
            value = value.replace(/[^\d.]/g, '');
            
            // Handle multiple decimal points
            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
            }
            
            // Limit decimal places to 2
            if (parts.length === 2 && parts[1].length > 2) {
                value = parts[0] + '.' + parts[1].substring(0, 2);
            }
            
            // Add currency prefix if there's a numeric value
            if (value && value !== '' && value !== '.') {
                value = currency + value;
            }
            
            console.log('Setting value to:', value);
            e.target.value = value;
        });
        
        // Handle keydown for better control
        input.addEventListener('keydown', function(e) {
            console.log('Key pressed:', e.key);
            const key = e.key;
            
            // Allow control keys
            if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End', 'ArrowLeft', 'ArrowRight'].includes(key)) {
                return;
            }
            
            // Allow Ctrl combinations
            if (e.ctrlKey && ['a', 'c', 'v', 'x', 'z'].includes(key.toLowerCase())) {
                return;
            }
            
            // Only allow digits and decimal point
            if (!/^[\d.]$/.test(key)) {
                console.log('Preventing non-numeric key:', key);
                e.preventDefault();
                return;
            }
            
            // Prevent multiple decimal points
            if (key === '.' && e.target.value.includes('.')) {
                console.log('Preventing multiple decimal points');
                e.preventDefault();
                return;
            }
        });
        
        // Additional keypress handler as backup
        input.addEventListener('keypress', function(e) {
            const char = String.fromCharCode(e.which || e.keyCode);
            if (!/[\d.]/.test(char) && ![8, 9, 13, 27, 46].includes(e.keyCode)) {
                console.log('Keypress prevented:', char);
                e.preventDefault();
            }
        });
        
        // Handle backspace to remove currency when empty
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace') {
                const value = e.target.value;
                // If only currency symbol remains, clear it on next backspace
                if (value === currency) {
                    setTimeout(() => {
                        e.target.value = '';
                    }, 0);
                }
            }
        });
        
        // Handle paste
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            let numericValue = paste.replace(/[^\d.]/g, '');
            
            // Handle decimal places
            const parts = numericValue.split('.');
            if (parts.length > 2) {
                numericValue = parts[0] + '.' + parts.slice(1).join('');
            }
            if (parts.length === 2 && parts[1].length > 2) {
                numericValue = parts[0] + '.' + parts[1].substring(0, 2);
            }
            
            if (numericValue) {
                e.target.value = currency + numericValue;
            }
        });
    });
}

/**
 * Get numeric value without currency symbol
 * @param {HTMLInputElement} input 
 * @returns {string} numeric value
 */
function getCurrencyNumericValue(input) {
    const currency = input.getAttribute('currency-localization');
    return input.value.replace(currency, '');
}

/**
 * Set currency value
 * @param {HTMLInputElement} input 
 * @param {string} value 
 */
function setCurrencyValue(input, value) {
    const currency = input.getAttribute('currency-localization');
    input.value = value ? currency + value : '';
}