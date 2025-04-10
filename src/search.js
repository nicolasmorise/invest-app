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
  