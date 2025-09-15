document.getElementById("forgotForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    let email = document.getElementById("email").value;

    if (!email.includes("@")) {
        document.getElementById("response").innerText = "Please enter a valid email.";
        return;
    }

    try {
        let response = await fetch("http://127.0.0.1:5000/forgot", {
            method: "POST",
            body: new URLSearchParams({ email: email })
        });

        let result = await response.json();

        if (result.success) {
            document.getElementById("response").style.color = "green";
            document.getElementById("response").innerText = "A reset link has been sent to your email.";
        } else {
            document.getElementById("response").innerText = result.message || "Failed to send reset link.";
        }
    } catch (err) {
        document.getElementById("response").innerText = "Error connecting to server.";
        console.error("Forgot password error:", err);
    }
});

document.getElementById("backToLoginBtn").addEventListener("click", function() {
    window.location.href = "login.html";
});
