const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());

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
        let success = true;
        if (fibonacci !== undefined) {
            let n = parseInt(fibonacci);
            if (isNaN(n) || n < 0) {
                return res.status(400).json({ is_success: false, message: "Invalid number for fibonacci" });
            }

            let series = [0, 1];
            if (n === 0) series = [];
            else if (n === 1) series = [0];
            else {
                while (series.length < n) {
                    let next = series[series.length - 1] + series[series.length - 2];
                    series.push(next);
                }
            }
            responseData = series;
        }
        else if (prime !== undefined) {
            if (!Array.isArray(prime)) {
                return res.status(400).json({ is_success: false, message: "Prime input must be an array" });
            }
            responseData = prime.filter(num => checkPrime(num));
        }
        else if (lcmInput !== undefined) {
            if (!Array.isArray(lcmInput) || lcmInput.length === 0) {
                return res.status(400).json({ is_success: false, message: "LCM input needs a non-empty array" });
            }
            
            let result = lcmInput[0];
            for (let i = 1; i < lcmInput.length; i++) {
                result = lcm(result, lcmInput[i]);
            }
            responseData = result;
        }
        else if (hcfInput !== undefined) {
            if (!Array.isArray(hcfInput) || hcfInput.length === 0) {
                return res.status(400).json({ is_success: false, message: "HCF input needs a non-empty array" });
            }
            let result = hcfInput[0];
            for (let i = 1; i < hcfInput.length; i++) {
                result = gcd(result, hcfInput[i]);
            }
            responseData = result;
        }
        else if (AI !== undefined) {
            if (!process.env.GEMINI_API_KEY) {
                console.log("Error: No API key found in .env");
                return res.status(500).json({ is_success: false, message: "Server config error" });
            }
            try {
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
                
                const prompt = {
                    contents: [{
                        parts: [{ text: "Answer this question in exactly one word: " + AI }]
                    }]
                };
                const aiRes = await axios.post(apiUrl, prompt);
                if (aiRes.data && aiRes.data.candidates && aiRes.data.candidates.length > 0) {
                    responseData = aiRes.data.candidates[0].content.parts[0].text.trim();
                } else {
                    responseData = "No_Response";
                }

            } catch (err) {
                console.error("Gemini API failed:", err.message);
                return res.status(500).json({ is_success: false, message: "AI Service failed" });
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
        console.error(e);
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