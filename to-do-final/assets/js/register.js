import bcrypt from "https://cdn.jsdelivr.net/npm/bcryptjs@3.0.2/+esm";
import UserRegistration from "./register_module.js";

var apiUrl = "http://localhost:3000/users";

// OBJECT CREATION

const registration = new UserRegistration();


$(document).ready(function () {

    $("#dob").attr("max", "2010-12-31");


    // Load saved registration data

    $("#username").val(localStorage.getItem("username"));
    $("#email").val(localStorage.getItem("email"));
    $("#phone").val(localStorage.getItem("phone"));
    $("#password").val(localStorage.getItem("password"));
    $("#confirmPassword").val(localStorage.getItem("confirmPassword"));
    $("#dob").val(localStorage.getItem("dob"));
    $("#address").val(localStorage.getItem("address"));

    let genderSelected = localStorage.getItem("gender");

    if (genderSelected) {

        $(`input[name='gender'][value='${genderSelected}']`)
            .prop("checked", true);

    }

    let checkedSkills =
        JSON.parse(localStorage.getItem("interests")) || [];

    $('input[name="interests"]').each(function () {

        if (checkedSkills.includes(this.value)) {

            $(this).prop("checked", true);

        }

    });

    let role = localStorage.getItem("role");

    if (role) {

        $("#role").val(role);

    }


    // Save form values to localStorage

    $("#username").on("input", function () {

        localStorage.setItem("username", $(this).val());

    });

    $("#email").on("input", function () {

        localStorage.setItem("email", $(this).val());

    });

    $("#phone").on("input", function () {

        localStorage.setItem("phone", $(this).val());

    });

    $("#password").on("input", function () {

        localStorage.setItem("password", $(this).val());

    });

    $("#confirmPassword").on("input", function () {

        localStorage.setItem(
            "confirmPassword",
            $(this).val()
        );

    });

    $("#dob").on("input", function () {

        localStorage.setItem("dob", $(this).val());

    });

    $("input[name='gender']").on("change", function () {

        localStorage.setItem(
            "gender",
            $("input[name='gender']:checked").val()
        );

    });

    $('input[name="interests"]').on("change", function () {

        let checkedSkills = [];

        $('input[name="interests"]:checked').each(function () {

            checkedSkills.push(this.value);

        });

        localStorage.setItem(
            "interests",
            JSON.stringify(checkedSkills)
        );

    });

    $("#role").on("change", function () {

        localStorage.setItem("role", $(this).val());

    });

    $("textarea").on("input", function () {

        localStorage.setItem(
            "address",
            $(this).val()
        );

    });


    // FORM SUBMIT

    $("#registerForm").submit(async function (event) {

        event.preventDefault();

        $("#messageBox").html("");

        var user = registration.getFormData();

        if (!registration.validate(user)) {

            return;

        }

        await registration.checkDuplicateEmail(user);

    });


    // Real-time validation

    $("#email").on("input", function () {

        var emailVal = $(this).val().trim();

        if (emailVal === "") {

            $("#emailError").text("");

            return;

        }

        if (!checkEmail(emailVal)) {

            $("#emailError").text("Enter a valid email");

        } else {

            $("#emailError").text("");

        }

    });


    $("#password").on("input", function () {

        var passVal = $(this).val();

        if (passVal === "") {

            $("#passwordError").text("");

            return;

        }

        if (!checkPassword(passVal)) {

            $("#passwordError").text(
                "Password must contain at least 8 characters, uppercase, lowercase, number and special character."
            );

        } else {

            $("#passwordError").text("");

        }

    });


    $("#confirmPassword").on("input", function () {

        var passVal = $(this).val();

        if (passVal === "") {

            $("#confirmPasswordError").text("");

            return;

        }

        if (!checkPassword(passVal)) {

            $("#confirmPasswordError").text(
                "Password must contain at least 8 characters, uppercase, lowercase, number and special character."
            );

        } else {

            $("#confirmPasswordError").text("");

        }

    });


    $("#phone").on("input", function () {

        var phoneVal = $(this).val().trim();

        if (phoneVal === "") {

            $("#phoneError").text("");

            return;

        }

        if (!checkPhone(phoneVal)) {

            $("#phoneError").text(
                "Phone number must be exactly 10 digits"
            );

        } else {

            $("#phoneError").text("");

        }

    });

});

