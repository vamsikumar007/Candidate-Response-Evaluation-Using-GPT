const questions = [
    "What is Object-Oriented Programming?",
    "What is a Class in OOP?",
    "What is an Object in OOP?",
    "Explain Inheritance.",
    "What is Polymorphism?",
    "What is Encapsulation?",
    "What is Abstraction?",
    "What is the difference between a Class and an Object?"
];

let currentQuestion = 0;
let answers = [];

// Load first question
loadQuestion();

// Next button event
document
    .getElementById("nextBtn")
    .addEventListener("click", nextQuestion);

function loadQuestion() {

    document.getElementById("questionNumber").innerText =
        `Question ${currentQuestion + 1} of ${questions.length}`;

    document.getElementById("question").value =
        questions[currentQuestion];

    document.getElementById("answer").value =
        answers[currentQuestion] || "";
}

function nextQuestion() {

    const answer =
        document.getElementById("answer").value.trim();

    if (answer === "") {
        alert("Please enter your answer.");
        return;
    }

    answers[currentQuestion] = answer;

    currentQuestion++;

    if (currentQuestion < questions.length) {
        loadQuestion();
    } else {
        evaluateAllAnswers();
    }
}

async function evaluateAllAnswers() {

    document.getElementById("questionBox").style.display =
        "none";

    let totalScore = 0;

    let allStrengths = [];
    let allWeaknesses = [];
    let allSuggestions = [];

    let resultHTML = "<h2>Evaluation Results</h2>";

    for (let i = 0; i < questions.length; i++) {

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/evaluate",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        question: questions[i],
                        candidate_answer: answers[i]
                    })
                }
            );

            const data = await response.json();

            totalScore += Number(data.score);

            allStrengths.push(...data.strengths);
            allWeaknesses.push(...data.weaknesses);
            allSuggestions.push(
                ...data.improvement_suggestions
            );

            resultHTML += `
                <div class="question-result">
                    <h3>Question ${i + 1}</h3>

                    <p>
                        <strong>Question:</strong>
                        ${questions[i]}
                    </p>

                    <p>
                        <strong>Score:</strong>
                        ${data.score}/10
                    </p>

                    <p>
                        <strong>Feedback:</strong>
                        ${data.feedback}
                    </p>
                </div>
            `;

        } catch (error) {

            resultHTML += `
                <div class="question-result">
                    <h3>Question ${i + 1}</h3>

                    <p style="color:red;">
                        Error evaluating this question.
                    </p>
                </div>
            `;

            console.error(error);
        }
    }

    // Remove duplicates
    allStrengths =
        [...new Set(allStrengths)];

    allWeaknesses =
        [...new Set(allWeaknesses)];

    allSuggestions =
        [...new Set(allSuggestions)];

    // Final score out of 10
    const finalScore =
        (totalScore / questions.length)
        .toFixed(1);

    resultHTML += `
        <hr>

        <h2>
            Final Score:
            ${finalScore}/10
        </h2>

        <h3>Overall Strengths</h3>
        <ul>
            ${
                allStrengths.length
                    ? allStrengths.map(
                        item =>
                        `<li>${item}</li>`
                    ).join("")
                    : "<li>No strengths identified.</li>"
            }
        </ul>

        <h3>Overall Weaknesses</h3>
        <ul>
            ${
                allWeaknesses.length
                    ? allWeaknesses.map(
                        item =>
                        `<li>${item}</li>`
                    ).join("")
                    : "<li>No weaknesses identified.</li>"
            }
        </ul>

        <h3>Improvement Suggestions</h3>
        <ul>
            ${
                allSuggestions.length
                    ? allSuggestions.map(
                        item =>
                        `<li>${item}</li>`
                    ).join("")
                    : "<li>No suggestions available.</li>"
            }
        </ul>
    `;

    document.getElementById("result").innerHTML =
        resultHTML;
}