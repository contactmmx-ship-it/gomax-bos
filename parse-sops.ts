import fs from "fs";

const content = fs.readFileSync("doc-content.txt", "utf8");
const lines = content.split("\n");

console.log("Searching for lines containing SOP or number between line 598 and 1214:");
for (let i = 597; i < 1214; i++) {
  const line = lines[i].trim();
  if (line.toLowerCase().includes("sop") || line.toLowerCase().includes("objective") || line.match(/^[a-zA-Z\s]+[0-9]+/)) {
    if (line.length < 100) {
      console.log(`Line ${i + 1}: ${line}`);
    }
  }
}
