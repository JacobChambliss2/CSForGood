document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    let formData = new FormData(this);

    try {
        let response = await fetch("http://127.0.0.1:5000/login", {
            method: "POST",
            body: formData
        });

        let result = await response.json();

        if (result.success) {
            window.location.href = "../Landing/Landing.html";
        } else {
            document.getElementById("response").innerText = "Invalid username or password.";
        }
    } catch (err) {
        document.getElementById("response").innerText = "Error connecting to server.";
        console.error("Login error:", err);
    }
});

// Handle create account button
document.getElementById("createAccountBtn").addEventListener("click", function() {
    window.location.href = "../Register/register.html"; // change to your signup page
});
