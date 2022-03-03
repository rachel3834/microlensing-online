console.log("Executing show_or_hide.js")

var show_or_hide = (function() {

  function toggle() {
  	var element = document.getElementById("toggleText");
  	var text = document.getElementById("displayText");
  	if(element.style.display == "block") {
      		element.style.display = "none";
  		text.innerHTML = "+" + text.innerHTML.slice(1, text.innerHTML.length);
    	}
  	else {
  		element.style.display = "block";
  		text.innerHTML = "&minus;" + text.innerHTML.slice(1, text.innerHTML.length);
  	}
}

  return {
    toggle: toggle,
    // toggleDiv: toggleDiv,
  };
})();
