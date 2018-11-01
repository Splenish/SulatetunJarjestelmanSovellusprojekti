function validateLogin() {
  var user = document.forms["login"]["username"].value;
  var pass = document.forms["login"]["password"].value;
  if (user == "" || pass == "") {
    alert("Username and Password field must both be filled!");
    return false;
  }
  //Validate user and pass
}
