const stockTable = document.querySelector(".stocks table .data");
const cryptoTable = document.querySelector(".crypto table .data");

// Fetch Stock Data (Price + Company Name)
async function fetchStockData(symbol, isSearch = false) {
    const apiKey = "CWOI1QMJ5LPB4NOU"; // Replace with your real key
  
    try {
      const priceResponse = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
      );
      const priceData = await priceResponse.json();
  
      if (!priceData || !priceData["Global Quote"] || !priceData["Global Quote"]["01. symbol"]) {
        console.warn("Stock not found:", symbol);
        return false; // Indicate stock wasn't found
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
        return true; // Stock was found
      } else {
        stockTable.innerHTML += row;
      }
  
    } catch (error) {
      console.error("Error fetching stock data:", error);
      return false;
    }
    return false;
}

// Fetch Crypto Data
async function fetchCryptoData() {
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,cardano,solana,ripple&vs_currencies=usd";

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Add rows for top 5 cryptos
        const cryptos = Object.keys(data).slice(0, 5);
        cryptos.forEach((crypto) => {
            const row = `
                <tr>
                    <td>${crypto.charAt(0).toUpperCase() + crypto.slice(1)}</td>
                    <td>${crypto.toUpperCase()}</td>
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

async function fetchCryptoDataById(cryptoId, isSearch = false) {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (!data[cryptoId]) {
        console.warn("Crypto not found:", cryptoId);
        return false;
      }
  
      const row = `
        <tr>
            <td>${cryptoId.charAt(0).toUpperCase() + cryptoId.slice(1)}</td>
            <td>${cryptoId.toUpperCase()}</td>
            <td>$${data[cryptoId].usd}</td>
            <td>N/A</td>
            <td>N/A</td>
        </tr>
      `;
  
      if (isSearch) {
        document.getElementById("searchData").innerHTML = row;
        return true;
      } else {
        cryptoTable.innerHTML += row;
      }
  
    } catch (error) {
      console.error("Error fetching crypto by ID:", error);
      return false;
    }
}

// Load data when the page loads
document.addEventListener("DOMContentLoaded", () => {
    // Fetch top 5 stocks
    const topStocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA"];
    topStocks.forEach(stock => fetchStockData(stock));
    
    // Fetch top 5 cryptos
    fetchCryptoData();
});