const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const USER_EMAIL = process.env.OFFICIAL_EMAIL || "vansh1566.be23@chitkarauniversity.edu.in";

function checkPrime(num) {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
}

const gcd = (a, b) => b == 0 ? a : gcd(b, a % b);
const lcm = (a, b) => (a * b) / gcd(a, b);

app.get('/health', (req, res) => {
    res.status(200).json({
        "is_success": true,
        "official_email": USER_EMAIL
    });
});

app.post('/bfhl', async (req, res) => {
    try {
        const { fibonacci, prime, lcm: lcmInput, hcf: hcfInput, AI } = req.body;
        let responseData = null;

        if (fibonacci !== undefined) {
            let n = parseInt(fibonacci);
            if (isNaN(n) || n < 0) return res.status(400).json({ is_success: false, message: "Invalid number" });
            
            let series = [0, 1];
            if (n === 0) series = [0];
            else if (n === 1) series = [0, 1];
            else {
                while (series.length < n) {
                    series.push(series[series.length - 1] + series[series.length - 2]);
                }
            }
            responseData = series.slice(0, n);
        }

        else if (prime !== undefined) {
            if (!Array.isArray(prime)) return res.status(400).json({ is_success: false, message: "Input must be an array" });
            responseData = prime.filter(num => Number.isInteger(num) && checkPrime(num));
        }

        else if (lcmInput !== undefined) {
            if (!Array.isArray(lcmInput) || lcmInput.length === 0) return res.status(400).json({ is_success: false, message: "Input must be a non-empty array" });
            let result = lcmInput[0];
            for (let i = 1; i < lcmInput.length; i++) {
                result = lcm(result, lcmInput[i]);
            }
            responseData = result;
        }

        else if (hcfInput !== undefined) {
            if (!Array.isArray(hcfInput) || hcfInput.length === 0) return res.status(400).json({ is_success: false, message: "Input must be a non-empty array" });
            let result = hcfInput[0];
            for (let i = 1; i < hcfInput.length; i++) {
                result = gcd(result, hcfInput[i]);
            }
            responseData = result;
        }

        else if (AI !== undefined) {
            if (!process.env.GEMINI_API_KEY) {
                return res.status(500).json({ is_success: false, message: "API Key missing" });
            }

            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

                const prompt = `Answer in one word: ${AI}`;
                const result = await model.generateContent(prompt);
                const response = await result.response;
                responseData = response.text().trim();
            } catch (err) {
                console.error("AI Error:", err);
                responseData = "AI_Service_Error";
            }
        } 
        
        else {
            return res.status(400).json({ is_success: false, message: "Invalid input key" });
        }

        res.json({
            "is_success": true,
            "official_email": USER_EMAIL,
            "data": responseData
        });

    } catch (e) {
        console.error("Server Error:", e);
        res.status(500).json({
            "is_success": false,
            "official_email": USER_EMAIL,
            "message": "Internal Server Error"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});