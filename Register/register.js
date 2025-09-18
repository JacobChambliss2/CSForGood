const steps = document.querySelectorAll(".form-step");
const nextBtns = document.querySelectorAll(".next-btn");
const prevBtns = document.querySelectorAll(".prev-btn");
const progressBar = document.getElementById("progress-bar");
const roleSelect = document.getElementById("role");

let currentStep = 0;

//  Get only steps relevant to the chosen role
function getVisibleSteps() {
    return Array.from(steps).filter(s => {
        return !s.dataset.role || s.dataset.role === roleSelect.value;
    });
}

//  Update progress bar with 1/5 style
function updateProgress() {
    const visibleSteps = getVisibleSteps();
    const totalSteps = visibleSteps.length;
    const stepText = (currentStep + 1) + "/" + totalSteps;
    const progress = ((currentStep + 1) / totalSteps) * 100;

    progressBar.style.width = progress + "%";
    progressBar.textContent = stepText;
}

//  Show a step safely
function showStep(step) {
    const visibleSteps = getVisibleSteps();

    // Clamp step to range
    if (step < 0) step = 0;
    if (step >= visibleSteps.length) step = visibleSteps.length - 1;

    // Hide all steps
    steps.forEach(s => s.classList.remove("active"));

    // Show only the current visible step
    visibleSteps[step].classList.add("active");

    currentStep = step;
    updateProgress();
}

//  Handle navigation
nextBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        showStep(currentStep + 1);
    });
});

prevBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        showStep(currentStep - 1);
    });
});

//  Handle form submission
document.getElementById("registerForm").addEventListener("submit", e => {
    e.preventDefault();
    document.getElementById("response").textContent = "Account created successfully!";
});

//  Recalculate when role changes
roleSelect.addEventListener("change", () => {
    currentStep = 0;
    showStep(currentStep);
});

//  Initialize
showStep(currentStep);

// Function to load subjects from CSV and build checkboxes
async function loadSubjects() {
    try {
        const response = await fetch("subjects.csv"); 
        const text = await response.text();

        // Split into lines, skip the header row
        const lines = text.trim().split("\n").slice(1);
        const container = document.getElementById("subjects-container");

        lines.forEach(subject => {
            const div = document.createElement("div");
            div.classList.add("checkbox-group");

            const input = document.createElement("input");
            input.type = "checkbox";
            input.name = "subjects";
            input.value = subject.trim();

            const label = document.createElement("label");
            label.textContent = subject.trim();

            div.appendChild(input);
            div.appendChild(label);
            container.appendChild(div);
        });
    } catch (error) {
        console.error("Error loading subjects:", error);
    }
}

// Load when DOM is ready
document.addEventListener("DOMContentLoaded", loadSubjects);
