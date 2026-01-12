require("dotenv").config()
let genai = require("@google/genai");

let ai = new genai.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});
console.log(process.env.GEMINI_API_KEY)
async function main() {
            const description="book ticket";
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Categorize this expense: "body checkup". 
    Return ONLY one word from these exact categories: Food, Fuel, Shopping, Movie, Entertainment, Transport, Bills, Healthcare, Education, Other.
    Just respond with the category name, nothing else.`
    });
    
    console.log(response.text);
}

main();