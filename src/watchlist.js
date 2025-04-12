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
    }

    setupEventListeners() {
        document.getElementById('addToWatchlistBtn').addEventListener('click', () => this.addToWatchlist());
        document.getElementById('watchlistSearchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addToWatchlist();
        });
    }

    async addToWatchlist() {
        const input = document.getElementById('watchlistSearchInput').value.trim().toUpperCase();
        if (!input) return;

        // Try to add as stock first
        const isStock = await this.tryAddStock(input);
        if (!isStock) {
            // If not a stock, try as crypto
            await this.tryAddCrypto(input.toLowerCase());
        }

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
                // Check if already in watchlist
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
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`;
        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data[cryptoId]) {
                // Check if already in watchlist
                if (!this.cryptoWatchlist.includes(cryptoId)) {
                    this.cryptoWatchlist.push(cryptoId);
                    localStorage.setItem('cryptoWatchlist', JSON.stringify(this.cryptoWatchlist));
                    return true;
                }
            }
        } catch (error) {
            console.error("Error checking crypto:", error);
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

        for (const cryptoId of this.cryptoWatchlist) {
            await this.fetchCryptoData(cryptoId, container);
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
                // If API fails, show basic info
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

    async fetchCryptoData(cryptoId, container) {
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`;
        try {
            const response = await fetch(url);
            const data = await response.json();

            if (!data[cryptoId]) {
                const row = this.createCryptoRow(cryptoId, "N/A");
                container.innerHTML += row;
                return;
            }

            const price = data[cryptoId].usd ? `$${data[cryptoId].usd}` : "N/A";
            const row = this.createCryptoRow(cryptoId, price);
            container.innerHTML += row;

        } catch (error) {
            console.error("Error fetching crypto data:", error);
            const row = this.createCryptoRow(cryptoId, "N/A");
            container.innerHTML += row;
        }
    }

    createCryptoRow(cryptoId, price) {
        const displayName = cryptoId.charAt(0).toUpperCase() + cryptoId.slice(1);
        return `
            <tr>
                <td>${displayName}</td>
                <td>${cryptoId.toUpperCase()}</td>
                <td>${price}</td>
                <td>N/A</td>
                <td>N/A</td>
                <td><button class="remove-btn" data-type="crypto" data-id="${cryptoId}">Remove</button></td>
            </tr>
        `;
    }

    removeFromWatchlist(type, symbol) {
        if (type === 'stock') {
            this.stockWatchlist = this.stockWatchlist.filter(item => item !== symbol);
            localStorage.setItem('stockWatchlist', JSON.stringify(this.stockWatchlist));
            this.loadStockWatchlist();
        } else if (type === 'crypto') {
            this.cryptoWatchlist = this.cryptoWatchlist.filter(item => item !== symbol);
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

// In watchlist.js
document.getElementById('watchlistSearchInput').addEventListener('input', async (e) => {
    const input = e.target.value.trim().toLowerCase();
    if (input.length < 2) return;
    
    // Fetch matching cryptos from CoinGecko
    const suggestions = await fetchCryptoSearchSuggestions(input);
    displaySearchSuggestions(suggestions);
  });
  
  async function fetchCryptoSearchSuggestions(query) {
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${query}`);
      const data = await response.json();
      return data.coins.slice(0, 5); // Return top 5 matches
    } catch (error) {
      console.error("Error fetching crypto suggestions:", error);
      return [];
    }
  }
  
  function displaySearchSuggestions(suggestions) {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    suggestionsContainer.innerHTML = '';
    
    suggestions.forEach(coin => {
      const suggestion = document.createElement('div');
      suggestion.className = 'search-suggestion';
      suggestion.textContent = `${coin.name} (${coin.symbol.toUpperCase()})`;
      suggestion.addEventListener('click', () => {
        document.getElementById('watchlistSearchInput').value = coin.id;
        suggestionsContainer.innerHTML = '';
      });
      suggestionsContainer.appendChild(suggestion);
    });
  }