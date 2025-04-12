document.getElementById("searchBtn").addEventListener("click", async () => {
  const input = document.getElementById("searchInput").value.trim().toUpperCase();

  if (!input) return;

  // Clear existing search results
  document.getElementById("searchData").innerHTML = "";

  // Try to fetch as stock first, then crypto
  const stockFound = await fetchStockData(input, true);
  if (!stockFound) {
    await fetchCryptoDataById(input.toLowerCase(), true);
  }
});

// Enter key support
document.getElementById("searchInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    document.getElementById("searchBtn").click();
  }
});