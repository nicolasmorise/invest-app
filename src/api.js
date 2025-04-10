const stockTable = document.querySelector(".stocks table");
const cryptoTable = document.querySelector(".crypto table");

// Fetch Stock Data (Price + Company Name)
async function fetchStockData(symbol, isSearch = false) {
    const apiKey = "CWOI1QMJ5LPB4NOU"; // Replace with your real key
  
    try {
      const priceResponse = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
      );
      const priceData = await priceResponse.json();
  
      if (!priceData || !priceData["Global Quote"] || !priceData["Global Quote"]["01. symbol"]) {
        console.warn("Stock not found. Trying crypto fallback...");
        if (isSearch) {
          fetchCryptoDataById(symbol.toLowerCase()); // Fallback
        }
        return;
      }
  
      const stock = priceData["Global Quote"];
  
      const overviewResponse = await fetch(
        `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`
      );
      const overviewData = await overviewResponse.json();
  
      const companyName = overviewData["Name"] || "Unknown";
  
      const row = `
        <tr>
          <td>${companyName}</td>
          <td>${stock["01. symbol"]}</td>
          <td>$${parseFloat(stock["05. price"] || 0).toFixed(2)}</td>
          <td>${stock["09. change"] || "N/A"}</td>
          <td>${stock["10. change percent"] || "N/A"}</td>
        </tr>
      `;
  
      if (isSearch) {
        document.getElementById("searchData").innerHTML = row;
      } else {
        document.querySelector(".stocks table .data").innerHTML += row;
      }
  
    } catch (error) {
      console.error("Error fetching stock data:", error);
    }
  }
  

document.getElementById("searchBtn").addEventListener("click", () => {
    const input = document.getElementById("searchInput").value.trim().toUpperCase();
  
    if (!input) return;
  
    // Clear existing rows
    document.querySelector(".stocks table .data").innerHTML = "";
    document.querySelector(".crypto table .data").innerHTML = "";
  
    // Try to fetch as stock first, then crypto
    fetchStockData(input).then(() => {
      fetchCryptoDataById(input.toLowerCase()); // Fallback for crypto
    });
  });
  
  // Optional: Enter key support
  document.getElementById("searchInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      document.getElementById("searchBtn").click();
    }
  });
  

// Fetch Crypto Data
async function fetchCryptoData() {
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd";

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Add rows for Bitcoin & Ethereum
        Object.keys(data).forEach((crypto) => {
            const row = `
                <tr>
                    <td>${crypto.toUpperCase()}</td>
                    <td>${crypto}</td>
                    <td>$${data[crypto].usd}</td>
                    <td>N/A</td>
                    <td>N/A</td>
                </tr>
            `;
            cryptoTable.innerHTML += row;
        });

    } catch (error) {
        console.error("Error fetching crypto data:", error);
    }
}

// Load data when the page loads
document.addEventListener("DOMContentLoaded", () => {
    fetchStockData("AAPL"); // Example: Fetch Apple stock
    fetchStockData("NVDA");
    fetchCryptoData(); // Fetch Crypto Data
});

async function fetchCryptoDataById(cryptoId) {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (!data[cryptoId]) {
        console.warn("Crypto not found:", cryptoId);
        return;
      }
  
      const row = `
        <tr>
            <td>${cryptoId.toUpperCase()}</td>
            <td>${cryptoId}</td>
            <td>$${data[cryptoId].usd}</td>
            <td>N/A</td>
            <td>N/A</td>
        </tr>
      `;
      document.querySelector(".crypto table .data").innerHTML += row;
  
    } catch (error) {
      console.error("Error fetching crypto by ID:", error);
    }
  }
  