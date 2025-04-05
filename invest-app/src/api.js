const stockTable = document.querySelector(".stocks table");
const cryptoTable = document.querySelector(".crypto table");

// Fetch Stock Data (Price + Company Name)
async function fetchStockData(symbol) {
    const apiKey = "CWOI1QMJ5LPB4NOU"; // Replace with your actual API key

    try {
        // Fetch Stock Price
        const priceResponse = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
        );
        const priceData = await priceResponse.json();

        // Check if data exists
        if (!priceData || !priceData["Global Quote"]) {
            console.error("Stock price data is missing or invalid:", priceData);
            return;
        }

        const stock = priceData["Global Quote"];

        // Fetch Company Name
        const overviewResponse = await fetch(
            `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`
        );
        const overviewData = await overviewResponse.json();

        // Check if company name exists
        const companyName = overviewData["Name"] || "Unknown";

        // Add row to the stock table
        const row = `
            <tr>
                <td>${companyName}</td>
                <td>${stock["01. symbol"] || "N/A"}</td>
                <td>$${parseFloat(stock["05. price"] || 0).toFixed(2)}</td>
                <td>${stock["09. change"] || "N/A"}</td>
                <td>${stock["10. change percent"] || "N/A"}</td>
            </tr>
        `;
        stockTable.innerHTML += row;

    } catch (error) {
        console.error("Error fetching stock data:", error);
    }
}

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
