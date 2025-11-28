import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedData = null;
let lastModified = null;

/**
 * Loads transaction data from JSON file with intelligent caching
 * Only reloads if file modification time changes
 * @returns {Promise<Object>} - Object with customers and transactions arrays
 * @throws {Error} - If file cannot be read or data structure is invalid
 */
export async function getTransactionData() {
  const filePath = path.join(__dirname, "..", "..", "data", "transactions.json");
  
  try {
    const stats = await fs.stat(filePath);
    
    if (!cachedData || stats.mtimeMs !== lastModified) {
      const data = await fs.readFile(filePath, "utf8");
      cachedData = JSON.parse(data);
      lastModified = stats.mtimeMs;
      
      if (!cachedData.customers || !cachedData.transactions) {
        throw new Error("Invalid data structure: missing customers or transactions");
      }
    }
    
    return cachedData;
  } catch (error) {
    throw new Error(`Failed to load transactions: ${error.message}`);
  }
}

