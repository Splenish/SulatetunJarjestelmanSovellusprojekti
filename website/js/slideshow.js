showSlide(0);
var next = 1;
setInterval("nextSlide()", 5000);

function showSlide(n) {
	var slides = document.getElementsByClassName("slides");
	var dots = document.getElementsByClassName("dot");
	var newSlide = n + 1;
	if (n >= slides.length) {	newSlide = 1; n = 0; }
	else if (n < 0) { newSlide = slides.length - 1; n = slides.length; }
	for (var slide = 0; slide < slides.length; slide++) {
		slides[slide].style.display = "none";
		slides[slide].className = slides[slide].className.replace(" fadeIn", "");
	}
	for (var dot = 0; dot < dots.length; dot++) {
		dots[dot].className = dots[dot].className.replace(" active", "");
	}
	slides[n].style.display = "block"; slides[n].className += " fadeIn";
	dots[n].className += " active";
	return newSlide;
}

function nextSlide() {
	next = showSlide(next);
}
