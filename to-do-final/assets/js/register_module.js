import bcrypt from "https://cdn.jsdelivr.net/npm/bcryptjs@3.0.2/+esm";

var apiUrl = "http://localhost:3000/users";

class UserRegistration {

    constructor(username, email, phone, password, confirmPassword, dob, gender, interests, role, address) {

        this.apiUrl = apiUrl;
        this.username = username;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.dob = dob;
        this.gender = gender;
        this.interests = interests;
        this.role = role;
        this.address = address;

    }

    validate() {

        $(".error").text("");

        var isValid = true;

        if (this.username == "") {

            $("#usernameError").text("Username is required");
            isValid = false;

        }

        if (this.email == "") {

            $("#emailError").text("Email is required");
            isValid = false;

        }
        else if (!UserRegistration.checkEmail(this.email)) {

            $("#emailError").text("Enter a valid email");
            isValid = false;

        }

        if (this.phone == "") {

            $("#phoneError").text("Phone number is required");
            isValid = false;

        }
        else if (!UserRegistration.checkPhone(this.phone)) {

            $("#phoneError").text("Phone number must be exactly 10 digits");
            isValid = false;

        }

        if (this.password == "") {

            $("#passwordError").text("Password is required");
            isValid = false;

        }
        else if (!UserRegistration.checkPassword(this.password)) {

            $("#passwordError").text(
                "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
            );

            isValid = false;

        }

        if (this.confirmPassword == "") {

            $("#confirmPasswordError").text("Confirm password is required");
            isValid = false;

        }
        else if (this.password != this.confirmPassword) {

            $("#confirmPasswordError").text("Passwords do not match");
            isValid = false;

        }

        if (this.dob == "") {

            $("#dobError").text("Date of birth is required");
            isValid = false;

        }
        else if (this.dob > this.getTodayDate()) {

            $("#dobError").text("Date of birth cannot be a future date");
            isValid = false;

        }

        if (!this.gender) {

            $("#genderError").text("Gender is required");
            isValid = false;

        }

        if (this.role == "") {

            $("#roleError").text("Role is required");
            isValid = false;

        }

        if (this.address == "") {

            $("#addressError").text("Address is required");
            isValid = false;

        }

        return isValid;

    }

    async checkDuplicateEmail() {

        try {

            var response = await fetch(
                this.apiUrl + "?email=" + encodeURIComponent(this.email)
            );

            var users = await response.json();

            if (users.length > 0) {

                $("#emailError").text("Email already registered");
                return false;

            }
            else {

                await this.saveUser();
                return true;

            }

        }
        catch (error) {

            $("#messageBox").html(
                "<div class='alert alert-danger'>JSON Server is not running.</div>"
            );

            return false;

        }

    }

    async saveUser() {

        var hashedPassword = await bcrypt.hash(this.password, 10);

        var newUser = {

            username: this.username,
            email: this.email,
            phone: this.phone,
            password: hashedPassword,
            dob: this.dob,
            gender: this.gender,
            interests: this.interests,
            role: this.role,
            address: this.address

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

        }
        catch (error) {

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

   static checkEmail(email) {

        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return emailPattern.test(email);

    }

    static checkPassword(password) {

        var passwordPattern =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

        return passwordPattern.test(password);

    }

   static checkPhone(phone) {

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