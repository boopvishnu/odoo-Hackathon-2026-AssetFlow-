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

});

var rememberCheckbox = document.getElementById("rememberMe");
rememberCheckbox.addEventListener("change", function() {
    if (rememberCheckbox.checked) {
        console.log("remember me checked");
    } else {
        console.log("remember me unchecked");
    }
});