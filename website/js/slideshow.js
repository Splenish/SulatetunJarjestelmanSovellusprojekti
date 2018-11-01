var imgIndex = 1;
showSlide(imgIndex);

function nextSlide(n) {
	showSlide(imgIndex += n);
}

function showSlide(n) {
	var slide = 1;
	var slides = document.getElementsByClassName("slides");
	if (n > slides.length) { imgIndex = 1; }
	if (n < 1) { imgIndex = slides.length; }
	for (slide = 0; slide < slides.length; slide++) {
		slides[slide].style.display = "none";
	}
	slides[imgIndex - 1].style.display = "block";
}
