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
        const visibleSteps = getVisibleSteps();
        const currentFormStep = visibleSteps[currentStep];

        // Special validation for subject step
        const isSubjectStep = currentFormStep.querySelector("#subjects-container") !== null;
        if (isSubjectStep) {
            const checkedSubjects = currentFormStep.querySelectorAll('input[name="subjects"]:checked');
            if (checkedSubjects.length === 0) {
                alert("Please select at least one subject before continuing.");
                return; // Stop navigation
            }
        }

        // Regular input validation
        const inputs = currentFormStep.querySelectorAll("input, select, textarea");

        for (let input of inputs) {
            if (!input.checkValidity()) {
                input.reportValidity(); // shows native popup
                return; // stop navigation
            }
        }

        // Navigation logic
        if (currentStep === 1 && roleSelect.value === "student") {
            showStep(currentStep + 2); // skip subject step for students
        } else {
            showStep(currentStep + 1);
        }

        console.log(currentStep);
        console.log(roleSelect.value);
    });
});

prevBtns.forEach(btn => {
    btn.addEventListener("click", () => {

        if (currentStep == 3 && roleSelect.value === "student") {
            // Skip step 3 for students
            showStep(currentStep - 2);
            return;
        }
        else
            showStep(currentStep - 1);
    console.log(currentStep);
    console.log(roleSelect.value);
    });
});

// Handle form submission
document.getElementById("registerForm").addEventListener("submit", e => {
    e.preventDefault();

    // === Collect form data ===
    const role = document.getElementById("role").value;
    const name = document.getElementById("name") ? document.getElementById("name").value : "";
    const email = document.getElementById("email") ? document.getElementById("email").value : "";
    const password = document.getElementById("password") ? document.getElementById("password").value : "";

    // Subjects (all selected checkboxes)
    const selectedSubjects = Array.from(
        document.querySelectorAll('input[name="subjects"]:checked')
    ).map(cb => cb.value);

        // Decide what "username" is — here we use email
    const username = email; // or: const username = name;

    fetch("hash.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body:
            "username=" + encodeURIComponent(username) +
            "&password=" + encodeURIComponent(password)
    })
    .then(response => response.text())
    .then(result => {
        console.log("Server response:", result);
    })
    .catch(err => console.error("Error:", err));

    // Bundle into variables / object
    const formData = {
        role,
        name,
        email,
        password,
        subjects: selectedSubjects,
    };

    console.log("Form data:", formData);

    // Show simple success message
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

document.getElementById("backToLoginBtn").addEventListener("click", function () {
    window.location.href = "../Landing/Landing.html";
});