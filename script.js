const paragraphs = {
    en: [
        "The sun began to set behind the distant mountains, casting a warm golden glow over the tranquil valley below.",
        "Artificial intelligence is transforming the way we interact with technology, opening new doors for innovation and creativity.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts in the long run.",
        "A journey of a thousand miles begins with a single step, but maintaining the pace is what gets you to the finish line.",
        "JavaScript is a versatile programming language that powers the interactive experiences we enjoy on the web every day.",
        "The quick brown fox jumps over the lazy dog is a classic pangram used to display font styles and test keyboards.",
        "In the heart of the city, the bustling streets were filled with the sounds of life, from honking cars to lively conversations.",
        "Programming is the art of telling another human what one wants the computer to do, in a way that the computer can actually follow.",
        "Nature has a way of reminding us of our place in the world, with its grand landscapes and intricate ecosystems.",
        "Deep learning and neural networks are at the forefront of modern machine learning research and application."
    ],
    bn: [
        "সূর্য্য দিগন্তের পাহাড়ের আড়ালে ডুব দিতে শুরু করেছে, শান্ত উপত্যকায় ছড়িয়ে দিচ্ছে এক মায়াবী সোনালী আভা।",
        "কৃত্রিম বুদ্ধিমত্তা আমাদের প্রযুক্তির সাথে যোগাযোগের ধরণ বদলে দিচ্ছে, সৃষ্টি করছে নতুন নতুন উদ্ভাবনের পথ।",
        "সাফল্যই শেষ নয়, ব্যর্থতাই মৃত্যু নয়: আসল হলো এগিয়ে যাওয়ার সাহস ধরে রাখা যা দীর্ঘ পথে সবচেয়ে মূল্যবান।",
        "হাজার মাইলের যাত্রা শুরু হয় একটি মাত্র পদক্ষেপ দিয়ে, তবে সেই গতি বজায় রাখাই হলো আসল লক্ষ্য অর্জন।",
        "প্রকৃতি আমাদের মনে করিয়ে দেয় এই বিশাল বিশ্বে আমাদের অবস্থানের কথা, তার অপূর্ব দৃশ্যপট আর বিস্ময়কর বাস্তুতন্ত্রের মাধ্যমে।",
        "একটি সুন্দর সকাল আমাদের জীবনকে নতুন করে সাজানোর এবং নতুন কিছু শেখার সুযোগ করে দেয় প্রতিদিন।",
        "শিক্ষাই হলো পৃথিবীর সবচেয়ে শক্তিশালী অস্ত্র, যা ব্যবহার করে আপনি আপনার চারপাশের জগতকে পরিবর্তন করতে পারেন।",
        "বই হলো মানুষের সবচেয়ে ভালো বন্ধু, যা তাকে অজানাকে জানতে এবং অদেখাকে দেখতে সাহায্য করে মনকে আলোকিত করে।",
        "পরিশ্রম হলো সৌভাগ্যের প্রসূতি, সঠিক লক্ষ্য এবং ধৈর্য থাকলে যেকোনো কঠিন কাজই সফলভাবে সম্পন্ন করা সম্ভব।",
        "বাংলাদেশের প্রাকৃতিক সৌন্দর্য মানুষকে বিমোহিত করে, তার সবুজ মাঠ আর বহতা নদীর ধার আমাদের প্রাণকে প্রশান্ত করে।"
    ]
};

// DOM Elements
const textDisplay = document.getElementById('text-display');
const typingInput = document.getElementById('typing-input');
const timerDisplay = document.getElementById('timer');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const errorsDisplay = document.getElementById('errors');
const resetBtn = document.getElementById('reset-btn');
const timeChips = document.querySelectorAll('.setting-group:first-child .chip');
const langChips = document.querySelectorAll('#language-chips .chip');
const bestScoreDisplay = document.getElementById('best-score');

// State Variables
let timer = 60;
let maxTime = 60;
let timeLeft = maxTime;
let charIndex = 0;
let errors = 0;
let isTyping = false;
let intervalId = null;
let currentLang = 'en';

// Initialize
function init() {
    loadNewParagraph();
    loadBestScore();

    // Event Listeners
    typingInput.addEventListener('input', handleTyping);
    resetBtn.addEventListener('click', resetGame);

    timeChips.forEach(chip => {
        chip.addEventListener('click', () => {
            timeChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            maxTime = parseInt(chip.getAttribute('data-time'));
            resetGame();
        });
    });

    langChips.forEach(chip => {
        chip.addEventListener('click', () => {
            langChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentLang = chip.getAttribute('data-lang');
            resetGame();
        });
    });

    // Autofocus input on load
    window.addEventListener('load', () => typingInput.focus());
}

function loadNewParagraph() {
    const langParagraphs = paragraphs[currentLang];
    const randomIndex = Math.floor(Math.random() * langParagraphs.length);
    textDisplay.innerHTML = "";

    // Using spread operator to handle multi-unit characters (graphemes) better
    [...langParagraphs[randomIndex]].forEach(char => {
        let span = `<span class="char">${char}</span>`;
        textDisplay.innerHTML += span;
    });

    textDisplay.querySelectorAll('span')[0].classList.add('current');
}

let totalCharsTyped = 0;

function handleTyping(e) {
    let currentCharacters = textDisplay.querySelectorAll('span');
    const currentTypedText = typingInput.value;

    // Relative index in current paragraph
    // If length is 5 and totalCharsTyped is 0, we just typed the 5th char (index 4)
    charIndex = currentTypedText.length - totalCharsTyped - 1;

    if (timeLeft > 0) {
        if (!isTyping) {
            isTyping = true;
            intervalId = setInterval(updateTimer, 1000);
        }

        if (e.inputType === "deleteContentBackward") {
            // Clearing the state of the character that was just DELETED
            // If length went from 5 to 4, charIndex is now 4-0-1=3.
            // The character deleted was at index 4.
            const deletedIndex = currentTypedText.length - totalCharsTyped;
            if (deletedIndex >= 0 && deletedIndex < currentCharacters.length) {
                currentCharacters[deletedIndex].classList.remove('correct', 'incorrect');
            }
        } else {
            // Processing the character just added at charIndex
            if (charIndex >= 0 && charIndex < currentCharacters.length) {
                const typedChar = currentTypedText.charAt(currentTypedText.length - 1);
                const targetChar = currentCharacters[charIndex].textContent;

                if (typedChar === targetChar) {
                    currentCharacters[charIndex].classList.add('correct');
                    currentCharacters[charIndex].classList.remove('incorrect');

                    // If paragraph completed
                    if (charIndex === currentCharacters.length - 1) {
                        totalCharsTyped += currentCharacters.length;
                        loadNewParagraph();
                        // Refresh characters list for the new paragraph
                        currentCharacters = textDisplay.querySelectorAll('span');
                    }
                } else {
                    errors++;
                    currentCharacters[charIndex].classList.add('incorrect');

                    // "Type hobe na" - Block incorrect input
                    typingInput.value = currentTypedText.slice(0, -1);

                    // Visual shake
                    currentCharacters[charIndex].style.animation = 'none';
                    void currentCharacters[charIndex].offsetWidth;
                    currentCharacters[charIndex].style.animation = 'shake 0.2s ease-in-out';
                }
            }
        }

        // Maintain cursor (current class)
        currentCharacters.forEach(span => span.classList.remove('current'));
        const nextTargetIndex = typingInput.value.length - totalCharsTyped;
        if (nextTargetIndex >= 0 && nextTargetIndex < currentCharacters.length) {
            const nextSpan = currentCharacters[nextTargetIndex];
            nextSpan.classList.add('current');

            // Auto-scroll display to keep cursor visible
            nextSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        updateStats();
    }
}

function updateStats() {
    let timePassed = maxTime - timeLeft;
    if (timePassed <= 0) timePassed = 1;

    // Total correct characters in the session
    const totalCorrect = typingInput.value.length;

    // Total characters typed (correctly) / 5 per word
    let wpm = Math.round((totalCorrect / 5) / (timePassed / 60));
    wpm = wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm;

    // Accuracy based on all attempts (correct + errors)
    const totalAttempted = totalCorrect + errors;
    let accuracy = totalAttempted === 0 ? 100 : Math.round((totalCorrect / totalAttempted) * 100);

    wpmDisplay.innerText = wpm;
    accuracyDisplay.innerText = `${accuracy}%`;
    errorsDisplay.innerText = errors;
}

function updateTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        timerDisplay.innerText = `${timeLeft}s`;
        updateStats();
    } else {
        clearInterval(intervalId);
        endGame();
    }
}

function endGame() {
    isTyping = false;
    typingInput.disabled = true;
    typingInput.placeholder = "Time's up!";
    saveBestScore();

    // Visual feedback
    textDisplay.style.opacity = "0.5";
    const finalWpm = wpmDisplay.innerText;
    bestScoreDisplay.innerHTML = `Game Over! Your Speed: <strong>${finalWpm} WPM</strong>. ${parseInt(finalWpm) > 40 ? 'Great job!' : 'Keep practicing!'}`;
}

function resetGame() {
    loadNewParagraph();
    clearInterval(intervalId);
    timeLeft = maxTime;
    charIndex = 0;
    errors = 0;
    isTyping = false;
    typingInput.disabled = false;
    typingInput.value = "";
    typingInput.placeholder = "Start typing here...";
    typingInput.focus();
    textDisplay.style.opacity = "1";
    timerDisplay.innerText = `${timeLeft}s`;
    wpmDisplay.innerText = 0;
    accuracyDisplay.innerText = "100%";
    errorsDisplay.innerText = 0;
    totalCharsTyped = 0;
}

function saveBestScore() {
    const currentWpm = parseInt(wpmDisplay.innerText);
    const bestWpm = localStorage.getItem('typingBestWpm') || 0;

    if (currentWpm > bestWpm) {
        localStorage.setItem('typingBestWpm', currentWpm);
        loadBestScore();
    }
}

function loadBestScore() {
    const bestWpm = localStorage.getItem('typingBestWpm');
    if (bestWpm) {
        bestScoreDisplay.innerText = `Your highest WPM: ${bestWpm} ⚡`;
    }
}

init();
