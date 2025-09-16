document.getElementById("registerForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        document.getElementById("response").innerText = "Passwords do not match.";
        return;
    }

    let formData = new FormData(this);

    try {
        let response = await fetch("http://127.0.0.1:5000/register", {
            method: "POST",
            body: formData
        });

        let result = await response.json();

        if (result.success) {
            window.location.href = "login.html"; // back to login after success
        } else {
            document.getElementById("response").innerText = result.message || "Registration failed.";
        }
    } catch (err) {
        document.getElementById("response").innerText = "Error connecting to server.";
        console.error("Register error:", err);
    }
});

// Back to login button
document.getElementById("backToLoginBtn").addEventListener("click", function() {
    window.location.href = "../Login/login.html";
});

let progress = 0;

function moveProgress() {
  if (progress >= 100) return; // stop at 100%
  progress += 10; // increase by 10
  const progressBar = document.getElementById("progress-bar");
  progressBar.style.width = progress + "%";
  progressBar.textContent = progress + "%";
}
