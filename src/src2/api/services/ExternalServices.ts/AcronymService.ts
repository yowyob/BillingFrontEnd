/**
 * Takes a sentence and returns a string concatenated from the 
 * first letter of each word in uppercase.
 * * Example: "hello world from typescript" -> "HWFT"
 */
export const getAcronym = (sentence: string): string => {
  if (!sentence) return "";

  return sentence
    .trim()                     // Remove leading/trailing whitespace
    .split(/\s+/)               // Split by one or more spaces
    .map(word => word[0])       // Take the first character of each word
    .join("")                   // Join them together
    .toUpperCase();             // Convert to uppercase
};