import json
import os
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from difflib import SequenceMatcher

load_dotenv()

app = Flask(__name__)
CORS(app)

# Load FAQ data
FAQ_TRAINING_DATA = []
FAQ_VARIANTS = []

def load_faq_data():
    global FAQ_TRAINING_DATA, FAQ_VARIANTS
    try:
        with open('faq_training_data.json', 'r', encoding='utf-8') as f:
            FAQ_TRAINING_DATA = json.load(f)
        print(f"✓ Loaded {len(FAQ_TRAINING_DATA)} FAQ training entries")
        
        with open('knowledge/faq.json', 'r', encoding='utf-8') as f:
            FAQ_VARIANTS = json.load(f)
        print(f"✓ Loaded {len(FAQ_VARIANTS)} FAQ question variants")
    except Exception as e:
        print(f"Error loading FAQ data: {e}")

# Load data on startup
load_faq_data()

def similarity_score(str1, str2):
    """Calculate similarity between two strings (0-1)"""
    return SequenceMatcher(None, str1.lower(), str2.lower()).ratio()

def is_greeting(question: str) -> bool:
    """Check if question is a greeting/small talk"""
    greetings = [
        'xin chào', 'xin chao', 'chào bạn', 'chào mình', 'chao ban',
        'hello', 'hi', 'hey', 'alo', 'alô'
    ]
    q_lower = question.lower().strip()
    
    # Exact match for short greetings
    if q_lower in ['chào', 'chao', 'hi', 'hey', 'hello', 'alo', 'alô']:
        return True
    
    # Check if question starts with greeting phrase
    for greeting in greetings:
        if q_lower.startswith(greeting):
            return True
    
    return False

def search_faq(question: str, threshold: float = 0.4, top_k: int = 3):
    """
    Search FAQ using fuzzy matching
    Returns top_k most similar Q&A pairs
    """
    results = []
    
    # Search in variants (more questions, same answers)
    for item in FAQ_VARIANTS:
        score = similarity_score(question, item['instruction'])
        if score >= threshold:
            results.append({
                'question': item['instruction'],
                'answer': item['output'],
                'category': item['category'],
                'score': score
            })
    
    # Sort by score and return top_k
    results.sort(key=lambda x: x['score'], reverse=True)
    return results[:top_k]

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "FAQ Support Agent - Bảo hiểm Sức khỏe 24/7",
        "version": "1.0.0",
        "faq_count": len(FAQ_TRAINING_DATA),
        "variant_count": len(FAQ_VARIANTS)
    }), 200

@app.route('/ask', methods=['POST'])
def ask_question():
    """Ask FAQ question endpoint"""
    try:
        data = request.get_json()
        
        if not data or 'question' not in data:
            return jsonify({
                "success": False,
                "error": "Missing required field: question"
            }), 400
        
        question = data['question']
        
        # Handle greetings/small talk
        if is_greeting(question):
            return jsonify({
                "success": True,
                "question": question,
                "answer": "Xin chào! 👋 Mình là trợ lý tư vấn Bảo hiểm Sức khỏe 24/7 trên Zalopay.\n\nMình có thể giúp bạn:\n• Tìm hiểu về sản phẩm Bảo hiểm Sức khỏe 24/7\n• Quyền lợi bảo hiểm (Nội trú, Ngoại trú, Khám từ xa)\n• Quy trình mua bảo hiểm\n• Quy trình bồi thường\n• Các câu hỏi thường gặp khác\n\nBạn cần tư vấn về vấn đề gì ạ? 😊",
                "is_greeting": True,
                "timestamp": datetime.now().isoformat()
            }), 200
        
        # Search FAQ (increased threshold to 0.45 for better accuracy)
        results = search_faq(question, threshold=0.45, top_k=3)
        
        if not results:
            return jsonify({
                "success": True,
                "question": question,
                "answer": "Xin lỗi, mình không tìm thấy thông tin phù hợp trong FAQ. Bạn có thể hỏi về:\n• Bảo hiểm Sức khỏe 24/7 là gì?\n• Quyền lợi bảo hiểm\n• Quy trình mua và sử dụng\n• Quy trình bồi thường\n• Thời hạn bảo hiểm\n\nHoặc bạn có thể diễn đạt câu hỏi theo cách khác để mình hiểu rõ hơn nhé! 🙏",
                "matches": [],
                "timestamp": datetime.now().isoformat()
            }), 200
        
        # Return best match
        best_match = results[0]
        
        return jsonify({
            "success": True,
            "question": question,
            "answer": best_match['answer'],
            "category": best_match['category'],
            "confidence": round(best_match['score'], 2),
            "related_questions": [
                {
                    "question": r['question'],
                    "category": r['category'],
                    "confidence": round(r['score'], 2)
                } 
                for r in results[1:3]
            ],
            "timestamp": datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/info', methods=['GET'])
def info():
    """Agent information endpoint"""
    return jsonify({
        "name": "FAQ Support Agent - Tư vấn Bảo hiểm Sức khỏe 24/7",
        "description": "AI agent providing insurance FAQ support for Zalopay health insurance",
        "language": "Vietnamese",
        "product": "Sức khỏe 24/7 - MSIG Việt Nam",
        "capabilities": [
            "Product information",
            "Insurance benefits explanation",
            "Purchase process guidance",
            "Claims process guidance",
            "General FAQ answering"
        ],
        "categories": list(set([item['category'] for item in FAQ_TRAINING_DATA])),
        "endpoints": {
            "health": "/health (GET)",
            "ask_question": "/ask (POST)",
            "info": "/info (GET)"
        },
        "total_questions": len(FAQ_TRAINING_DATA),
        "total_variants": len(FAQ_VARIANTS)
    }), 200

@app.route('/', methods=['GET'])
def home():
    """Home page with API documentation"""
    html = """
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FAQ Support Agent - API</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
            }
            .container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            }
            h1 {
                color: #667eea;
                margin-bottom: 10px;
                font-size: 2.5em;
            }
            .subtitle {
                color: #666;
                font-size: 1.2em;
                margin-bottom: 30px;
            }
            .section {
                margin: 30px 0;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
                border-left: 4px solid #667eea;
            }
            h2 {
                color: #667eea;
                margin-bottom: 15px;
            }
            .endpoint {
                background: white;
                padding: 15px;
                margin: 10px 0;
                border-radius: 6px;
                border: 1px solid #e0e0e0;
            }
            .method {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 4px;
                font-weight: bold;
                font-size: 0.9em;
                margin-right: 10px;
            }
            .get { background: #4caf50; color: white; }
            .post { background: #2196f3; color: white; }
            code {
                background: #f5f5f5;
                padding: 2px 6px;
                border-radius: 3px;
                font-family: 'Courier New', monospace;
            }
            pre {
                background: #2d2d2d;
                color: #f8f8f2;
                padding: 15px;
                border-radius: 6px;
                overflow-x: auto;
                margin: 10px 0;
            }
            .test-section {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 8px;
                margin: 30px 0;
            }
            input, textarea, button {
                width: 100%;
                padding: 12px;
                margin: 10px 0;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-size: 1em;
            }
            textarea {
                min-height: 100px;
                resize: vertical;
            }
            button {
                background: white;
                color: #667eea;
                font-weight: bold;
                cursor: pointer;
                border: none;
                transition: all 0.3s;
            }
            button:hover {
                background: #f0f0f0;
                transform: translateY(-2px);
            }
            #response {
                background: white;
                color: #333;
                padding: 20px;
                border-radius: 6px;
                margin-top: 20px;
                min-height: 100px;
                max-height: 400px;
                overflow-y: auto;
            }
            .stat {
                display: inline-block;
                background: white;
                color: #667eea;
                padding: 10px 20px;
                border-radius: 6px;
                margin: 5px;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🤖 FAQ Support Agent</h1>
            <p class="subtitle">Tư vấn Bảo hiểm Sức khỏe 24/7 - Zalopay</p>
            
            <div class="section">
                <h2>📊 Agent Statistics</h2>
                <div class="stat">✓ Status: ACTIVE</div>
                <div class="stat">📚 FAQ Base: Loading...</div>
                <div class="stat">🔄 Variants: Loading...</div>
            </div>

            <div class="section">
                <h2>📍 API Endpoints</h2>
                
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <code>/health</code>
                    <p>Health check - verify agent status</p>
                </div>
                
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <code>/ask</code>
                    <p>Ask FAQ questions</p>
                    <pre>curl -X POST /ask \\
  -H "Content-Type: application/json" \\
  -d '{"question": "Bảo hiểm Sức khỏe 24/7 là gì?"}'</pre>
                </div>
                
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <code>/info</code>
                    <p>Get agent information and capabilities</p>
                </div>
            </div>

            <div class="test-section">
                <h2>🧪 Test Agent</h2>
                <p>Thử hỏi về Bảo hiểm Sức khỏe 24/7:</p>
                <textarea id="question" placeholder="Ví dụ: Bảo hiểm Sức khỏe 24/7 là gì?"></textarea>
                <button onclick="askQuestion()">Gửi câu hỏi</button>
                <div id="response"></div>
            </div>
        </div>

        <script>
            // Load stats
            fetch('/info')
                .then(r => r.json())
                .then(data => {
                    document.querySelectorAll('.stat')[1].textContent = '📚 FAQ Base: ' + data.total_questions;
                    document.querySelectorAll('.stat')[2].textContent = '🔄 Variants: ' + data.total_variants;
                });

            async function askQuestion() {
                const question = document.getElementById('question').value;
                const responseDiv = document.getElementById('response');
                
                if (!question.trim()) {
                    responseDiv.innerHTML = '<p style="color: #f44336;">Vui lòng nhập câu hỏi</p>';
                    return;
                }
                
                responseDiv.innerHTML = '<p>Đang tìm kiếm...</p>';
                
                try {
                    const response = await fetch('/ask', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ question })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        let html = `
                            <h3 style="color: #667eea; margin-bottom: 10px;">📝 Câu trả lời:</h3>
                            <p style="margin-bottom: 15px; line-height: 1.8;">${data.answer}</p>
                        `;
                        
                        if (data.category) {
                            html += `<p style="color: #666;"><strong>Danh mục:</strong> ${data.category}</p>`;
                        }
                        
                        if (data.confidence) {
                            html += `<p style="color: #666;"><strong>Độ tin cậy:</strong> ${(data.confidence * 100).toFixed(0)}%</p>`;
                        }
                        
                        if (data.related_questions && data.related_questions.length > 0) {
                            html += `<h4 style="color: #667eea; margin-top: 20px;">Câu hỏi liên quan:</h4><ul style="margin-left: 20px;">`;
                            data.related_questions.forEach(q => {
                                html += `<li style="margin: 5px 0;">${q.question} <span style="color: #999;">(${(q.confidence * 100).toFixed(0)}%)</span></li>`;
                            });
                            html += `</ul>`;
                        }
                        
                        responseDiv.innerHTML = html;
                    } else {
                        responseDiv.innerHTML = `<p style="color: #f44336;">Lỗi: ${data.error}</p>`;
                    }
                } catch (error) {
                    responseDiv.innerHTML = `<p style="color: #f44336;">Lỗi: ${error.message}</p>`;
                }
            }
            
            // Allow Enter to submit
            document.getElementById('question').addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    askQuestion();
                }
            });
        </script>
    </body>
    </html>
    """
    return html

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
