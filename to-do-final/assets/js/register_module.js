import bcrypt from "https://cdn.jsdelivr.net/npm/bcryptjs@3.0.2/+esm";

var apiUrl = "http://localhost:3000/users";

class UserRegistration {

    constructor() {
        this.apiUrl = apiUrl;
    }

    getFormData() {

        var username = $("#username").val().trim();
        var email = $("#email").val().trim();
        var phone = $("#phone").val().trim();
        var password = $("#password").val().trim();
        var confirmPassword = $("#confirmPassword").val().trim();
        var dob = $("#dob").val();
        var gender = $("input[name='gender']:checked").val();

        var interests = [];

        $("input[name='interests']:checked").each(function () {
            interests.push($(this).val());
        });

        var role = $("#role").val();
        var address = $("#address").val().trim();

        return {
            username,
            email,
            phone,
            password,
            confirmPassword,
            dob,
            gender,
            interests,
            role,
            address
        };
    }

    validate(user) {

        $(".error").text("");

        var isValid = true;

        if (user.username == "") {
            $("#usernameError").text("Username is required");
            isValid = false;
        }

        if (user.email == "") {
            $("#emailError").text("Email is required");
            isValid = false;
        }
        else if (!this.checkEmail(user.email)) {
            $("#emailError").text("Enter a valid email");
            isValid = false;
        }

        if (user.phone == "") {
            $("#phoneError").text("Phone number is required");
            isValid = false;
        }
        else if (!this.checkPhone(user.phone)) {
            $("#phoneError").text("Phone number must be exactly 10 digits");
            isValid = false;
        }

        if (user.password == "") {
            $("#passwordError").text("Password is required");
            isValid = false;
        }
        else if (!this.checkPassword(user.password)) {
            $("#passwordError").text(
                "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
            );
            isValid = false;
        }

        if (user.confirmPassword == "") {
            $("#confirmPasswordError").text("Confirm password is required");
            isValid = false;
        }
        else if (user.password != user.confirmPassword) {
            $("#confirmPasswordError").text("Passwords do not match");
            isValid = false;
        }

        if (user.dob == "") {
            $("#dobError").text("Date of birth is required");
            isValid = false;
        }
        else if (user.dob > this.getTodayDate()) {
            $("#dobError").text("Date of birth cannot be a future date");
            isValid = false;
        }

        if (!user.gender) {
            $("#genderError").text("Gender is required");
            isValid = false;
        }

        if (user.role == "") {
            $("#roleError").text("Role is required");
            isValid = false;
        }

        if (user.address == "") {
            $("#addressError").text("Address is required");
            isValid = false;
        }

        return isValid;
    }

    async checkDuplicateEmail(user) {

        try {

            var response = await fetch(
                this.apiUrl + "?email=" + encodeURIComponent(user.email)
            );

            var users = await response.json();

            if (users.length > 0) {

                $("#emailError").text("Email already registered");

                return false;

            } else {

                await this.saveUser(user);

                return true;
            }

        } catch (error) {

            $("#messageBox").html(
                "<div class='alert alert-danger'>JSON Server is not running.</div>"
            );

            return false;
        }
    }

    async saveUser(user) {

        var hashedPassword = await bcrypt.hash(user.password, 10);

        var newUser = {

            username: user.username,
            email: user.email,
            phone: user.phone,
            password: hashedPassword,
            dob: user.dob,
            gender: user.gender,
            interests: user.interests,
            role: user.role,
            address: user.address

        };

        try {

            var response = await fetch(this.apiUrl, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(newUser)

            });

            await response.json();

            this.clearRegisterDraft();

            $("#messageBox").html(
                "<div class='alert alert-success'>Registration successful. Redirecting to login...</div>"
            );

            sessionStorage.setItem("registrationSuccess", "true");

            window.location.href = "login.html";

        } catch (error) {

            $("#messageBox").html(
                "<div class='alert alert-danger'>Unable to register user.</div>"
            );
        }
    }

    clearRegisterDraft() {

        [
            "username",
            "email",
            "phone",
            "password",
            "confirmPassword",
            "dob",
            "gender",
            "interests",
            "role",
            "address"
        ].forEach(function (key) {

            localStorage.removeItem(key);

        });

        $("#registerForm")[0].reset();
    }
    checkEmail(email) {

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);
}

checkPassword(password) {

    var passwordPattern =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    return passwordPattern.test(password);
}

checkPhone(phone) {

    var phonePattern = /^\d{10}$/;

    return phonePattern.test(phone);
}

getTodayDate() {

    var today = new Date();

    var year = today.getFullYear();

    var month =
        String(today.getMonth() + 1).padStart(2, "0");

    var day =
        String(today.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}
}


export default UserRegistration;