// Quote data structure
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Success" },
    { text: "In the middle of difficulty lies opportunity.", category: "Opportunity" },
    { text: "The journey of a thousand miles begins with one step.", category: "Journey" },
    { text: "Believe you can and you're halfway there.", category: "Belief" },
    { text: "It does not matter how slowly you go as long as you do not stop.", category: "Persistence" }
];

let currentQuoteIndex = -1;
let filteredQuotes = [...quotes];

// Storage keys
const STORAGE_KEYS = {
    QUOTES: 'dynamicQuoteGenerator_quotes',
    LAST_VIEWED: 'dynamicQuoteGenerator_lastViewed',
    USER_PREFERENCES: 'dynamicQuoteGenerator_preferences',
    LAST_FILTER: 'dynamicQuoteGenerator_lastFilter'
};

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuoteBtn');
const categoryFilter = document.getElementById('categoryFilter');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const totalQuotesSpan = document.getElementById('totalQuotes');
const totalCategoriesSpan = document.getElementById('totalCategories');
const storageStatusSpan = document.getElementById('storageStatus');
const lastViewedSpan = document.getElementById('lastViewed');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Load quotes from local storage
    loadQuotesFromStorage();
    
    // Set up event listeners
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    categoryFilter.addEventListener('change', filterQuotes);
    
    // Initialize category filter
    updateCategoryFilter();
    
    // Load and restore last selected filter
    restoreLastSelectedFilter();
    
    // Update stats
    updateStats();
    
    // Update storage status
    updateStorageStatus();
    
    // Load last viewed quote from session storage
    loadLastViewedFromSession();
    
    // Show initial quote
    showRandomQuote();
}

// Web Storage Functions

function saveQuotesToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
        updateStorageStatus();
        return true;
    } catch (error) {
        console.error('Error saving to local storage:', error);
        updateStorageStatus('Error saving data');
        return false;
    }
}

function loadQuotesFromStorage() {
    try {
        const storedQuotes = localStorage.getItem(STORAGE_KEYS.QUOTES);
        if (storedQuotes) {
            const parsedQuotes = JSON.parse(storedQuotes);
            if (Array.isArray(parsedQuotes) && parsedQuotes.length > 0) {
                quotes = parsedQuotes;
                filteredQuotes = [...quotes];
                console.log('Quotes loaded from local storage:', quotes.length);
            }
        }
    } catch (error) {
        console.error('Error loading from local storage:', error);
        updateStorageStatus('Error loading data');
    }
}

function saveToSessionStorage(key, data) {
    try {
        sessionStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to session storage:', error);
        return false;
    }
}

function loadFromSessionStorage(key) {
    try {
        const data = sessionStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading from session storage:', error);
        return null;
    }
}

function saveLastViewedToSession(quote) {
    const lastViewedData = {
        text: quote.text,
        category: quote.category,
        timestamp: new Date().toISOString()
    };
    saveToSessionStorage(STORAGE_KEYS.LAST_VIEWED, lastViewedData);
    updateLastViewedDisplay(lastViewedData);
}

function loadLastViewedFromSession() {
    const lastViewed = loadFromSessionStorage(STORAGE_KEYS.LAST_VIEWED);
    if (lastViewed) {
        updateLastViewedDisplay(lastViewed);
    }
}

// Function to save the last selected filter to local storage
function saveLastFilterToLocalStorage(selectedCategory) {
    try {
        localStorage.setItem(STORAGE_KEYS.LAST_FILTER, selectedCategory);
        return true;
    } catch (error) {
        console.error('Error saving filter to local storage:', error);
        return false;
    }
}

// Function to load the last selected filter from local storage
function loadLastFilterFromLocalStorage() {
    try {
        const lastFilter = localStorage.getItem(STORAGE_KEYS.LAST_FILTER);
        return lastFilter || 'all';
    } catch (error) {
        console.error('Error loading filter from local storage:', error);
        return 'all';
    }
}

function updateStorageStatus(status = null) {
    if (status) {
        storageStatusSpan.textContent = status;
        return;
    }
    
    try {
        const used = JSON.stringify(quotes).length;
        const maxSize = 5 * 1024 * 1024; // 5MB typical limit
        const percentage = Math.round((used / maxSize) * 100);
        
        if (percentage > 80) {
            storageStatusSpan.textContent = `High usage (${percentage}%)`;
            storageStatusSpan.style.color = '#ff9800';
        } else if (percentage > 50) {
            storageStatusSpan.textContent = `Moderate usage (${percentage}%)`;
            storageStatusSpan.style.color = '#ffc107';
        } else {
            storageStatusSpan.textContent = `Normal usage (${percentage}%)`;
            storageStatusSpan.style.color = '#4caf50';
        }
    } catch (error) {
        storageStatusSpan.textContent = 'Status unavailable';
        storageStatusSpan.style.color = '#f44336';
    }
}

function updateLastViewedDisplay(lastViewed) {
    if (lastViewed) {
        const timeAgo = getTimeAgo(new Date(lastViewed.timestamp));
        lastViewedSpan.textContent = `${lastViewed.text.substring(0, 30)}... (${timeAgo})`;
    } else {
        lastViewedSpan.textContent = 'None';
    }
}

function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

// JSON Import/Export Functions

function exportToJson() {
    try {
        const dataStr = JSON.stringify(quotes, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `quotes_${new Date().toISOString().split('T')[0]}.json`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        displayMessage('Quotes exported successfully!', 'success');
    } catch (error) {
        console.error('Error exporting quotes:', error);
        displayMessage('Error exporting quotes. Please try again.', 'error');
    }
}

function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const fileReader = new FileReader();
    
    fileReader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            
            if (!Array.isArray(importedQuotes)) {
                throw new Error('Invalid JSON format: expected an array');
            }
            
            // Validate quote structure
            const validQuotes = importedQuotes.filter(quote => 
                quote && typeof quote.text === 'string' && typeof quote.category === 'string'
            );
            
            if (validQuotes.length === 0) {
                throw new Error('No valid quotes found in the file');
            }
            
            // Add imported quotes
            quotes.push(...validQuotes);
            
            // Update filtered quotes
            if (categoryFilter.value === 'all') {
                filteredQuotes.push(...validQuotes);
            } else {
                const categoryMatches = validQuotes.filter(quote => 
                    quote.category === categoryFilter.value
                );
                filteredQuotes.push(...categoryMatches);
            }
            
            // Save to local storage
            saveQuotesToLocalStorage();
            
            // Update UI
            updateCategoryFilter();
            updateStats();
            
            // Clear file input
            event.target.value = '';
            
            displayMessage(`${validQuotes.length} quotes imported successfully!`, 'success');
            
            // Show the first imported quote
            if (validQuotes.length > 0) {
                currentQuoteIndex = filteredQuotes.length - validQuotes.length;
                showRandomQuote();
            }
            
        } catch (error) {
            console.error('Error importing quotes:', error);
            displayMessage(`Error importing quotes: ${error.message}`, 'error');
            event.target.value = '';
        }
    };
    
    fileReader.onerror = function() {
        displayMessage('Error reading file. Please try again.', 'error');
        event.target.value = '';
    };
    
    fileReader.readAsText(file);
}

function clearAllQuotes() {
    if (confirm('Are you sure you want to clear all quotes? This action cannot be undone.')) {
        quotes = [];
        filteredQuotes = [];
        currentQuoteIndex = -1;
        
        // Clear from local storage
        localStorage.removeItem(STORAGE_KEYS.QUOTES);
        
        // Clear from session storage
        sessionStorage.removeItem(STORAGE_KEYS.LAST_VIEWED);
        
        // Update UI
        updateCategoryFilter();
        updateStats();
        updateStorageStatus();
        updateLastViewedDisplay(null);
        
        // Show message
        displayMessage('All quotes have been cleared.', 'info');
        
        // Reset quote display
        quoteDisplay.innerHTML = '<div>Click "Show New Quote" to get started!</div>';
    }
}

// Enhanced existing functions

function showRandomQuote() {
    if (filteredQuotes.length === 0) {
        displayMessage("No quotes available in this category.");
        return;
    }
    
    // Get a random quote that's different from the current one
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    } while (randomIndex === currentQuoteIndex && filteredQuotes.length > 1);
    
    currentQuoteIndex = randomIndex;
    const quote = filteredQuotes[randomIndex];
    
    // Save to session storage
    saveLastViewedToSession(quote);
    
    // Clear existing content
    quoteDisplay.innerHTML = '';
    
    // Create quote elements dynamically
    const quoteContainer = document.createElement('div');
    quoteContainer.className = 'quote-container';
    
    const quoteText = document.createElement('div');
    quoteText.className = 'quote-text';
    quoteText.textContent = `"${quote.text}"`;
    
    const quoteCategory = document.createElement('div');
    quoteCategory.className = 'quote-category';
    quoteCategory.textContent = quote.category;
    
    // Add animation class
    quoteContainer.classList.add('fade-in');
    
    // Append elements
    quoteContainer.appendChild(quoteText);
    quoteContainer.appendChild(quoteCategory);
    quoteDisplay.appendChild(quoteContainer);
    
    // Remove animation class after animation completes
    setTimeout(() => {
        quoteContainer.classList.remove('fade-in');
    }, 500);
}

function addQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();
    
    if (!text || !category) {
        alert('Please enter both quote text and category.');
        return;
    }
    
    // Create new quote object
    const newQuote = { text, category };
    
    // Add to quotes array
    quotes.push(newQuote);
    
    // Update filtered quotes if needed
    if (categoryFilter.value === 'all' || categoryFilter.value === category) {
        filteredQuotes.push(newQuote);
    }
    
    // Save to local storage
    saveQuotesToLocalStorage();
    
    // Clear form inputs
    newQuoteText.value = '';
    newQuoteCategory.value = '';
    
    // Update category filter options
    updateCategoryFilter();
    
    // Update stats
    updateStats();
    
    // Show success message
    displayMessage(`Quote added successfully! Total quotes: ${quotes.length}`, 'success');
    
    // Show the new quote
    currentQuoteIndex = filteredQuotes.length - 1;
    showRandomQuote();
}

// Function to dynamically create the add quote form
function createAddQuoteForm() {
    // Check if form already exists
    const existingForm = document.querySelector('.add-quote-form-container');
    if (existingForm) {
        return; // Form already exists
    }
    
    // Create form container
    const formContainer = document.createElement('div');
    formContainer.className = 'add-quote-form-container';
    formContainer.style.cssText = `
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 20px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    `;
    
    // Create form title
    const formTitle = document.createElement('h3');
    formTitle.textContent = 'Add New Quote';
    formTitle.style.cssText = `
        margin-top: 0;
        margin-bottom: 20px;
        text-align: center;
    `;
    
    // Create quote text input
    const quoteTextInput = document.createElement('input');
    quoteTextInput.type = 'text';
    quoteTextInput.placeholder = 'Enter a new quote';
    quoteTextInput.id = 'dynamicQuoteText';
    quoteTextInput.style.cssText = `
        width: 100%;
        padding: 12px;
        margin: 5px 0;
        border: none;
        border-radius: 8px;
        font-size: 1em;
        background: rgba(255, 255, 255, 0.9);
        color: #333;
        margin-bottom: 15px;
    `;
    
    // Create category input
    const categoryInput = document.createElement('input');
    categoryInput.type = 'text';
    categoryInput.placeholder = 'Enter quote category';
    categoryInput.id = 'dynamicQuoteCategory';
    categoryInput.style.cssText = `
        width: 100%;
        padding: 12px;
        margin: 5px 0;
        border: none;
        border-radius: 8px;
        font-size: 1em;
        background: rgba(255, 255, 255, 0.9);
        color: #333;
        margin-bottom: 20px;
    `;
    
    // Create add button
    const addButton = document.createElement('button');
    addButton.textContent = 'Add Quote';
    addButton.style.cssText = `
        background: linear-gradient(45deg, #ff6b6b, #ee5a24);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 25px;
        cursor: pointer;
        font-size: 1em;
        width: 100%;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    
    // Add event listener to the button
    addButton.addEventListener('click', function() {
        const text = quoteTextInput.value.trim();
        const category = categoryInput.value.trim();
        
        if (!text || !category) {
            alert('Please enter both quote text and category.');
            return;
        }
        
        // Create new quote object
        const newQuote = { text, category };
        
        // Add to quotes array
        quotes.push(newQuote);
        
        // Update filtered quotes if needed
        if (categoryFilter.value === 'all' || categoryFilter.value === category) {
            filteredQuotes.push(newQuote);
        }
        
        // Save to local storage
        saveQuotesToLocalStorage();
        
        // Clear form inputs
        quoteTextInput.value = '';
        categoryInput.value = '';
        
        // Update category filter options
        updateCategoryFilter();
        
        // Update stats
        updateStats();
        
        // Show success message
        displayMessage(`Quote added successfully! Total quotes: ${quotes.length}`, 'success');
        
        // Show the new quote
        currentQuoteIndex = filteredQuotes.length - 1;
        showRandomQuote();
    });
    
    // Add focus effects
    quoteTextInput.addEventListener('focus', function() {
        this.style.boxShadow = '0 0 0 3px rgba(255, 255, 255, 0.3)';
    });
    
    quoteTextInput.addEventListener('blur', function() {
        this.style.boxShadow = 'none';
    });
    
    categoryInput.addEventListener('focus', function() {
        this.style.boxShadow = '0 0 0 3px rgba(255, 255, 255, 0.3)';
    });
    
    categoryInput.addEventListener('blur', function() {
        this.style.boxShadow = 'none';
    });
    
    // Add hover effect to button
    addButton.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
    });
    
    addButton.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    });
    
    // Add keyboard support
    quoteTextInput.addEventListener('keydown', function(event) {
        if (event.code === 'Enter') {
            categoryInput.focus();
        }
    });
    
    categoryInput.addEventListener('keydown', function(event) {
        if (event.code === 'Enter') {
            addButton.click();
        }
    });
    
    // Assemble the form
    formContainer.appendChild(formTitle);
    formContainer.appendChild(quoteTextInput);
    formContainer.appendChild(categoryInput);
    formContainer.appendChild(addButton);
    
    // Insert the form after the quote display container
    const quoteContainer = document.querySelector('.container');
    if (quoteContainer) {
        quoteContainer.parentNode.insertBefore(formContainer, quoteContainer.nextSibling);
    }
    
    // Focus on the first input
    quoteTextInput.focus();
}

// Function to filter quotes by category
function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    
    // Save the selected filter to local storage
    saveLastFilterToLocalStorage(selectedCategory);
    
    if (selectedCategory === 'all') {
        filteredQuotes = [...quotes];
    } else {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }
    
    // Reset current quote index
    currentQuoteIndex = -1;
    
    // Show a quote from the filtered selection
    if (filteredQuotes.length > 0) {
        showRandomQuote();
    } else {
        displayMessage("No quotes available in this category.");
    }
}

// Function to update category filter options
function updateCategoryFilter() {
    // Get unique categories
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Clear existing options except "All Categories"
    const allOption = categoryFilter.querySelector('option[value="all"]');
    categoryFilter.innerHTML = '';
    categoryFilter.appendChild(allOption);
    
    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Function to populate categories in the filter dropdown
function populateCategories() {
    // Get unique categories from quotes
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Clear existing options except "All Categories"
    const allOption = categoryFilter.querySelector('option[value="all"]');
    categoryFilter.innerHTML = '';
    categoryFilter.appendChild(allOption);
    
    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Update stats to reflect current categories
    updateStats();
}

// Function to restore the last selected filter from local storage
function restoreLastSelectedFilter() {
    const lastFilter = loadLastFilterFromLocalStorage();
    
    // Set the category filter to the last selected value
    if (categoryFilter.value !== lastFilter) {
        categoryFilter.value = lastFilter;
        
        // Apply the filter immediately
        if (lastFilter === 'all') {
            filteredQuotes = [...quotes];
        } else {
            filteredQuotes = quotes.filter(quote => quote.category === lastFilter);
        }
        
        // Reset current quote index
        currentQuoteIndex = -1;
    }
}

// Function to update statistics
function updateStats() {
    const uniqueCategories = new Set(quotes.map(quote => quote.category));
    
    totalQuotesSpan.textContent = quotes.length;
    totalCategoriesSpan.textContent = uniqueCategories.size;
}

// Function to display messages
function displayMessage(message, type = 'info') {
    // Clear existing content
    quoteDisplay.innerHTML = '';
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    quoteDisplay.appendChild(messageDiv);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    .fade-in {
        animation: fadeIn 0.5s ease-in;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .quote-container {
        transition: all 0.3s ease;
    }
    
    .message {
        text-align: center;
        padding: 20px;
        border-radius: 8px;
        font-weight: bold;
    }
    
    .message.success {
        background: rgba(76, 175, 80, 0.2);
        border: 1px solid rgba(76, 175, 80, 0.5);
    }
    
    .message.info {
        background: rgba(33, 150, 243, 0.2);
        border: 1px solid rgba(33, 150, 243, 0.5);
    }
    
    .message.error {
        background: rgba(244, 67, 54, 0.2);
        border: 1px solid rgba(244, 67, 54, 0.5);
    }
`;
document.head.appendChild(style);

// Add keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space' && event.target === document.body) {
        event.preventDefault();
        showRandomQuote();
    }
    
    if (event.code === 'Enter' && (event.target === newQuoteText || event.target === newQuoteCategory)) {
        addQuote();
    }
});

// Add touch/swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(event) {
    touchStartX = event.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(event) {
    touchEndX = event.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - show new quote
            showRandomQuote();
        } else {
            // Swipe right - could be used for other functionality
            // For now, just show new quote
            showRandomQuote();
        }
    }
}

// Add some interactive features
function addQuoteWithAnimation(quote) {
    // Create a temporary element that slides in
    const tempQuote = document.createElement('div');
    tempQuote.className = 'temp-quote';
    tempQuote.textContent = quote.text;
    tempQuote.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.9);
        color: #333;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideIn 0.5s ease-out;
    `;
    
    document.body.appendChild(tempQuote);
    
    // Remove after animation
    setTimeout(() => {
        tempQuote.remove();
    }, 2000);
}

// Enhanced quote display with typing effect
function displayQuoteWithTypingEffect(quote) {
    quoteDisplay.innerHTML = '';
    
    const quoteContainer = document.createElement('div');
    quoteContainer.className = 'quote-container typing';
    
    const quoteText = document.createElement('div');
    quoteText.className = 'quote-text';
    quoteText.textContent = '';
    
    const quoteCategory = document.createElement('div');
    quoteCategory.className = 'quote-category';
    quoteCategory.textContent = '';
    
    quoteContainer.appendChild(quoteText);
    quoteContainer.appendChild(quoteCategory);
    quoteDisplay.appendChild(quoteContainer);
    
    // Type out the quote text
    let index = 0;
    const text = `"${quote.text}"`;
    const typeInterval = setInterval(() => {
        quoteText.textContent += text[index];
        index++;
        if (index >= text.length) {
            clearInterval(typeInterval);
            // Show category after quote is typed
            setTimeout(() => {
                quoteCategory.textContent = quote.category;
            }, 200);
        }
    }, 50);
}

// Export functions for potential external use
window.QuoteGenerator = {
    showRandomQuote,
    addQuote,
    createAddQuoteForm,
    filterQuotes,
    populateCategories,
    restoreLastSelectedFilter,
    saveLastFilterToLocalStorage,
    loadLastFilterFromLocalStorage,
    getQuotes: () => [...quotes],
    getFilteredQuotes: () => [...filteredQuotes]
};
