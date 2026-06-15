async function evaluateAnswer() {

    const question = document.getElementById("question").value.trim();
    const answer = document.getElementById("answer").value.trim();

    if (answer === "") {
        alert("Please enter the candidate answer.");
        return;
    }

    document.getElementById("result").innerHTML =
        "<p>Evaluating response...</p>";

    try {

        const response = await fetch("http://127.0.0.1:8000/evaluate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question: question,
                candidate_answer: answer
            })
        });

        const data = await response.json();

        document.getElementById("result").innerHTML = `
            <h3>Evaluation Result</h3>

            <p><b>Score:</b> ${data.score}/10</p>

            <p><b>Strengths:</b></p>
            <ul>
                ${data.strengths.map(item => `<li>${item}</li>`).join("")}
            </ul>

            <p><b>Weaknesses:</b></p>
            <ul>
                ${data.weaknesses.map(item => `<li>${item}</li>`).join("")}
            </ul>

            <p><b>Feedback:</b></p>
            <p>${data.feedback}</p>

            <p><b>Improvement Suggestions:</b></p>
            <ul>
                ${data.improvement_suggestions.map(item => `<li>${item}</li>`).join("")}
            </ul>
        `;

    } catch (error) {

        document.getElementById("result").innerHTML = `
            <p style="color:red;">
                Error connecting to backend.
            </p>
        `;

        console.error(error);
    }
}