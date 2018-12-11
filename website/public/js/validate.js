function validateEdit() {
	var em = document.getElementById("email").value;
	var phone = document.getElementById("phonenumber").value;
	if (!validateEmail(em)) {
		alert("Invalid email!");
		return false;
	}
	if (!validatePhone(phone)) {
		alert("Invalid phonenumber!");
		return false;
	}
	return true;
}

function validateEmail(email) {
    if (email == "") { return true; }
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validatePhone(phone) {
	if (phone == "") { return true; }
	var re = /^\+?\d+$/;
	return re.test(String(phone).toLowerCase());
}