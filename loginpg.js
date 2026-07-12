function togglePassword() {
    var pass = document.getElementById("loginPassword");
    var eye = document.getElementById("toggleEye");

    if (pass.type == "password") {
        pass.type = "text";
        eye.innerText = "hide";
    } else {
        pass.type = "password";
        eye.innerText = "show";
    }
}

// login form submit
document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    var id = document.getElementById("loginId").value;
    var pass = document.getElementById("loginPassword").value;

    // basic empty check
    if (id == "" || pass == "") {
        alert("please fill all fields");
        return;
    }

    if (pass.length < 6) {
        alert("password should be at least 6 characters");
        return;
    }

    console.log("login attempt:", id);

    // TODO: connect this to backend / Odoo later
});

// remember me checkbox - just logging for now
var rememberCheckbox = document.getElementById("rememberMe");
rememberCheckbox.addEventListener("change", function() {
    if (rememberCheckbox.checked) {
        console.log("remember me checked");
    } else {
        console.log("remember me unchecked");
    }
});