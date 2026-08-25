import bcrypt from "https://cdn.jsdelivr.net/npm/bcryptjs@3.0.2/+esm";


var apiUrl = "http://localhost:3000/users";

$(document).ready(function () {
    if (sessionStorage.getItem("registrationSuccess") === "true") {
        showToast("Registration successful. Please login.", "success", 3000);
        sessionStorage.removeItem("registrationSuccess");
    }

    $("#loginForm").submit(function (event) {
        event.preventDefault();
        $(".error").text("");
        $("#loginMessage").html("");

        var email = $("#email").val().trim();
        var password = $("#password").val().trim();
        var isValid = true;

        // Simple jQuery validation
        if (email == "") {
            $("#emailError").text("Email is required");
            isValid = false;
        } else if (!checkEmail(email)) {
            $("#emailError").text("Enter a valid email");
            isValid = false;
        }

        if (password == "") {
            $("#passwordError").text("Password is required");
            isValid = false;
        }

        if (isValid) {
            loginUser(email, password);
        }
    });
});

function checkEmail(email) {
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function showToast(message, variant, delay) {
    var toastEl = document.getElementById('loginToast');
    if (!toastEl) return;

    var toastBody = toastEl.querySelector('.toast-body');
    toastBody.textContent = message;

    toastEl.classList.remove('text-bg-success', 'text-bg-danger', 'text-bg-warning', 'text-bg-info');
    toastEl.classList.add(variant === 'success' ? 'text-bg-success' : variant === 'error' ? 'text-bg-danger' : 'text-bg-info');

    var toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: delay });
    toast.show();
}

async function loginUser(email, password) {

    try {

        // Get user only by email
        var response = await fetch(
            apiUrl + "?email=" + encodeURIComponent(email)
        );

        var users = await response.json();

        if (users.length > 0) {

            var user = users[0];

            // Compare entered password with stored bcrypt hash
            var passwordMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (passwordMatch) {

                localStorage.setItem("loggedUser", JSON.stringify(user));

                sessionStorage.setItem("loginSuccess", "true");

                window.location.href = "dashboard.html";

            } else {

                $("#loginMessage").html(
                    "<div class='alert alert-danger'>Invalid email or password</div>"
                );

            }

        } else {

            $("#loginMessage").html(
                "<div class='alert alert-danger'>Invalid email or password</div>"
            );

        }

    } catch (error) {

        $("#loginMessage").html(
            "<div class='alert alert-danger'>JSON Server is not running.</div>"
        );

    }
}
