// Load header and footer dynamically
async function loadCommonElements() {
    const headerResponse = await fetch('../public/header.html');
    const headerData = await headerResponse.text();
    document.getElementById('dynamic-header').innerHTML = headerData;

    const footerResponse = await fetch('../public/footer.html');
    const footerData = await footerResponse.text();
    document.getElementById('dynamic-footer').innerHTML = footerData;

    // Initialize mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const menu = document.querySelector('.menu');
            menu.classList.toggle('active');
        });
    }
}

// Watchlist functionality
class Watchlist {
    constructor() {
        this.stockWatchlist = JSON.parse(localStorage.getItem('stockWatchlist')) || [];
        this.cryptoWatchlist = JSON.parse(localStorage.getItem('cryptoWatchlist')) || [];
        this.init();
    }

    init() {
        loadCommonElements();
        this.loadWatchlist();
        this.setupEventListeners();
        
        // Initialize popular crypto buttons
        document.querySelectorAll('.crypto-option').forEach(button => {
            button.addEventListener('click', async () => {
                const cryptoId = button.dataset.id;
                await this.tryAddCrypto(cryptoId);
                this.loadWatchlist();
            });
        });
    }

    setupEventListeners() {
        document.getElementById('addToWatchlistBtn').addEventListener('click', () => this.addToWatchlist());
        document.getElementById('watchlistSearchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addToWatchlist();
        });
        
        // Search suggestions
        document.getElementById('watchlistSearchInput').addEventListener('input', async (e) => {
            const input = e.target.value.trim().toLowerCase();
            const suggestionsContainer = document.getElementById('searchSuggestions');
            suggestionsContainer.innerHTML = '';
            
            if (input.length < 2) return;
            
            try {
                const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${input}`);
                const data = await response.json();
                
                data.coins.slice(0, 5).forEach(coin => {
                    const suggestion = document.createElement('div');
                    suggestion.className = 'search-suggestion';
                    suggestion.textContent = `${coin.name} (${coin.symbol.toUpperCase()})`;
                    suggestion.dataset.id = coin.id;
                    suggestion.addEventListener('click', () => {
                        document.getElementById('watchlistSearchInput').value = coin.id;
                        suggestionsContainer.innerHTML = '';
                    });
                    suggestionsContainer.appendChild(suggestion);
                });
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            }
        });
    }

    async addToWatchlist() {
        const input = document.getElementById('watchlistSearchInput').value.trim();
        if (!input) return;

        // Try to add as stock first (if it's all uppercase letters)
        if (/^[A-Z]+$/.test(input)) {
            const isStock = await this.tryAddStock(input);
            if (isStock) {
                document.getElementById('watchlistSearchInput').value = '';
                this.loadWatchlist();
                return;
            }
        }

        // Try as crypto
        await this.tryAddCrypto(input.toLowerCase());
        document.getElementById('watchlistSearchInput').value = '';
        this.loadWatchlist();
    }

    async tryAddStock(symbol) {
        const apiKey = "CWOI1QMJ5LPB4NOU";
        try {
            const response = await fetch(
                `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
            );
            const data = await response.json();

            if (data && data["Global Quote"] && data["Global Quote"]["01. symbol"]) {
                if (!this.stockWatchlist.includes(symbol)) {
                    this.stockWatchlist.push(symbol);
                    localStorage.setItem('stockWatchlist', JSON.stringify(this.stockWatchlist));
                    return true;
                }
            }
        } catch (error) {
            console.error("Error checking stock:", error);
        }
        return false;
    }

    async tryAddCrypto(cryptoId) {
        try {
            const url = `https://api.coingecko.com/api/v3/coins/${cryptoId}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.id) {
                if (!this.cryptoWatchlist.some(item => item.id === cryptoId)) {
                    const cryptoItem = {
                        id: data.id,
                        name: data.name,
                        symbol: data.symbol
                    };
                    this.cryptoWatchlist.push(cryptoItem);
                    localStorage.setItem('cryptoWatchlist', JSON.stringify(this.cryptoWatchlist));
                    return true;
                }
            }
        } catch (error) {
            console.error("Error adding crypto:", error);
        }
        return false;
    }

    async loadWatchlist() {
        await this.loadStockWatchlist();
        await this.loadCryptoWatchlist();
    }

    async loadStockWatchlist() {
        const container = document.getElementById('stockWatchlistData');
        container.innerHTML = '';

        if (this.stockWatchlist.length === 0) {
            container.innerHTML = '<tr><td colspan="6" class="empty-watchlist">Your stock watchlist is empty</td></tr>';
            return;
        }

        for (const symbol of this.stockWatchlist) {
            await this.fetchStockData(symbol, container);
        }
    }

    async loadCryptoWatchlist() {
        const container = document.getElementById('cryptoWatchlistData');
        container.innerHTML = '';

        if (this.cryptoWatchlist.length === 0) {
            container.innerHTML = '<tr><td colspan="6" class="empty-watchlist">Your crypto watchlist is empty</td></tr>';
            return;
        }

        for (const cryptoItem of this.cryptoWatchlist) {
            await this.fetchCryptoData(cryptoItem, container);
        }
    }

    async fetchStockData(symbol, container) {
        const apiKey = "CWOI1QMJ5LPB4NOU";
        try {
            const priceResponse = await fetch(
                `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
            );
            const priceData = await priceResponse.json();

            if (!priceData || !priceData["Global Quote"]) {
                const row = this.createStockRow(symbol, "Unknown", "N/A", "N/A", "N/A");
                container.innerHTML += row;
                return;
            }

            const stock = priceData["Global Quote"];

            const overviewResponse = await fetch(
                `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`
            );
            const overviewData = await overviewResponse.json();

            const companyName = overviewData["Name"] || symbol;
            const price = stock["05. price"] ? `$${parseFloat(stock["05. price"]).toFixed(2)}` : "N/A";
            const change = stock["09. change"] || "N/A";
            const changePercent = stock["10. change percent"] || "N/A";

            const row = this.createStockRow(symbol, companyName, price, change, changePercent);
            container.innerHTML += row;

        } catch (error) {
            console.error("Error fetching stock data:", error);
            const row = this.createStockRow(symbol, symbol, "N/A", "N/A", "N/A");
            container.innerHTML += row;
        }
    }

    createStockRow(symbol, name, price, change, changePercent) {
        return `
            <tr>
                <td>${name}</td>
                <td>${symbol}</td>
                <td>${price}</td>
                <td>${change}</td>
                <td>${changePercent}</td>
                <td><button class="remove-btn" data-type="stock" data-symbol="${symbol}">Remove</button></td>
            </tr>
        `;
    }

    async fetchCryptoData(cryptoItem, container) {
        try {
            const url = `https://api.coingecko.com/api/v3/coins/${cryptoItem.id}`;
            const response = await fetch(url);
            const data = await response.json();
            
            const price = data.market_data?.current_price?.usd ? 
                `$${data.market_data.current_price.usd.toFixed(2)}` : "N/A";
                
            const change24h = data.market_data?.price_change_24h ?
                `$${data.market_data.price_change_24h.toFixed(2)}` : "N/A";
                
            const changePercent24h = data.market_data?.price_change_percentage_24h ?
                `${data.market_data.price_change_percentage_24h.toFixed(2)}%` : "N/A";

            const row = this.createCryptoRow(
                cryptoItem.name,
                cryptoItem.symbol.toUpperCase(),
                price,
                change24h,
                changePercent24h,
                cryptoItem.id
            );
            container.innerHTML += row;
        } catch (error) {
            console.error("Error fetching crypto data:", error);
            const row = this.createCryptoRow(
                cryptoItem.name,
                cryptoItem.symbol.toUpperCase(),
                "N/A",
                "N/A",
                "N/A",
                cryptoItem.id
            );
            container.innerHTML += row;
        }
    }

    createCryptoRow(name, symbol, price, change, changePercent, id) {
        return `
            <tr>
                <td>${name}</td>
                <td>${symbol}</td>
                <td>${price}</td>
                <td>${change}</td>
                <td>${changePercent}</td>
                <td><button class="remove-btn" data-type="crypto" data-id="${id}">Remove</button></td>
            </tr>
        `;
    }

    removeFromWatchlist(type, symbol) {
        if (type === 'stock') {
            this.stockWatchlist = this.stockWatchlist.filter(item => item !== symbol);
            localStorage.setItem('stockWatchlist', JSON.stringify(this.stockWatchlist));
            this.loadStockWatchlist();
        } else if (type === 'crypto') {
            this.cryptoWatchlist = this.cryptoWatchlist.filter(item => item.id !== symbol);
            localStorage.setItem('cryptoWatchlist', JSON.stringify(this.cryptoWatchlist));
            this.loadCryptoWatchlist();
        }
    }
}

// Initialize the watchlist when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const watchlist = new Watchlist();

    // Event delegation for remove buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            const type = e.target.dataset.type;
            const symbol = e.target.dataset.symbol || e.target.dataset.id;
            watchlist.removeFromWatchlist(type, symbol);
        }
    });
});

document.getElementById('watchlistSearchInput').addEventListener('input', async (e) => {
    const input = e.target.value.trim().toLowerCase();
    const searchSection = document.querySelector('.search-section');
    const suggestionsContainer = document.getElementById('searchSuggestions');
    
    suggestionsContainer.innerHTML = '';
    
    if (input.length < 2) {
        searchSection.classList.remove('active');
        return;
    }
    
    searchSection.classList.add('active');
    
    // Rest of your search code...
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const searchSection = document.querySelector('.search-section');
    if (!searchSection.contains(e.target)) {
        searchSection.classList.remove('active');
    }
});

