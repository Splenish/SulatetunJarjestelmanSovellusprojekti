

function validateLogin() {
  var un = document.loginform.usr.value;
  var pw = document.loginform.pword.value;

  //fetch user and pw from db
  var dbuser = "user";
  var dbpass = "pass";
  if (un == dbuser && pw == dbpass) {
    //save session account id
    //move to logged in page
    alert("Yay?");
  }
  else {
    //invalid login retry
    alert("Invalid login credentials!");
    document.loginform.usr.value = "";
    document.loginform.pword.value = "";
  }
}
