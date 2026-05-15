/**
 * Groq API를 사용한 채팅 로직
 */

// 환경 변수에서 API 키를 가져옵니다. 
// 브라우저 환경(Vite 등)이라면 import.meta.env.VITE_GROQ_KEY 등을 사용해야 할 수 있습니다.
const GROQ_API_KEY = process.env.GROQ_API_KEY || '여기에_직접_키를_넣거나_환경변수를_설정하세요';
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * AI에게 메시지를 보내고 응답을 받는 함수
 * @param {string} userMessage - 사용자가 입력한 메시지
 * @returns {Promise<string>} - AI의 응답 텍스트
 */
async function fetchGroqResponse(userMessage) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // Groq에서 지원하는 모델 (예: llama3-8b-8192, mixtral-8x7b-32768 등)
                model: "llama3-8b-8192", 
                messages: [
                    {
                        role: "system",
                        content: "당신은 친절하고 유능한 AI 비서입니다. 한국어로 답변해 주세요."
                    },
                    {
                        role: "user",
                        content: userMessage
                    }
                ],
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "API 호출 중 오류 발생");
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error("Groq API Error:", error);
        return "죄송합니다. 응답을 가져오는 중 오류가 발생했습니다.";
    }
}

// HTML UI와 연결하는 부분
document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    const sendBtn = document.getElementById('send-btn');

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (!message) return;

        // 1. 사용자 메시지 추가
        appendMessage('user', message);
        userInput.value = '';
        
        // 2. 로딩 상태 표시
        sendBtn.disabled = true;
        const loadingDiv = appendMessage('ai', '입력 중...');

        // 3. Groq API 호출
        const aiResponse = await fetchGroqResponse(message);
        
        // 4. 로딩 메시지를 실제 응답으로 교체
        loadingDiv.querySelector('.bubble').textContent = aiResponse;
        sendBtn.disabled = false;
        
        // 스크롤 하단 이동
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    function appendMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        messageDiv.innerHTML = `<div class="bubble">${text}</div>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageDiv;
    }
});
