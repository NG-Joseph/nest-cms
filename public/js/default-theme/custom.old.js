//For delete close button
document.addEventListener('DOMContentLoaded', () => {
    (document.querySelectorAll('.notification .delete') || []).forEach(($delete) => {
        var $notification = $delete.parentNode;

        $delete.addEventListener('click', () => {
            $notification.parentNode.removeChild($notification);
        });
    });
});

//Below is for bulma navigation bar
document.addEventListener('DOMContentLoaded', () => {
    // Get all "navbar-burger" elements
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
    // Check if there are any navbar burgers
    if ($navbarBurgers.length > 0) {
        // Add a click event on each of them
        $navbarBurgers.forEach(el => {
            el.addEventListener('click', () => {
                // Get the target from the "data-target" attribute
                const target = el.dataset.target;
                const $target = document.getElementById(target);
                // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
                el.classList.toggle('is-active');
                $target.classList.toggle('is-active');
            });
        });
    }
});

//Below if for light/dark theme switch
document.addEventListener('DOMContentLoaded', () => {
    //This flag really should be on the server side for those logged in. User object can include darkTheme of boolean type
  const overrideSystemTheme = false; 
  // Select the button
  const btn = document.querySelector("#toggle-theme");
    // Select the stylesheet <link>
  const theme = document.querySelector("#theme-link");

  const themeURLRoot = '/public/css/default-theme';

  if (overrideSystemTheme){
    
    //First check to see if there is a system setting for theme dark/light mode
    let systemThemeSetting = '';
    if (window.matchMedia){
      systemThemeSetting = window.matchMedia('(prefers-color-scheme: dark)').matches? "dark": "light" 
    } 

    // Select the theme preference from localStorage
    const storedTheme = localStorage.getItem("theme")
    const currentTheme = storedTheme? storedTheme : systemThemeSetting; //systemThemeSetting is default

    // If the current theme in localStorage is "dark"...
    if (currentTheme == "dark") {
      // ...then use the .dark-theme class
      theme.href = themeURLRoot + "/dark-theme.min.css";
    }else{
      theme.href = themeURLRoot + "/light-theme.min.css";  
    }
  
    // Listen for a click on the button 
    btn.addEventListener("click", function() {
      //Below is one way to toggle and save in localStorage
      const theme = document.querySelector("#theme-link");

      if ((window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) && theme.getAttribute("href") == themeURLRoot + "/sgvi-1-mini-cms.min.css") {
        //alert('dark matches')
        theme.href = themeURLRoot + "/light-theme.min.css";
      }else if (theme.getAttribute("href") == themeURLRoot + "/dark-theme.min.css") {  
        // dark mode is on. Switch to light mode
        //alert('dark matches')
        theme.href = themeURLRoot + "/light-theme.min.css";
      }else{
        //switch to dark mode
        //alert('light matches')
        theme.href = themeURLRoot + "/dark-theme.min.css";
      }
/*
      if (theme.getAttribute("href") == themeURLRoot + "/light-theme.min.css") {
        // ... then switch it to "dark-theme.css"
        theme.href = themeURLRoot + "/dark-theme.min.css";
        // Otherwise...
      } else {
        // ... switch it to "light-theme.css"
        theme.href = themeURLRoot + "/light-theme.min.css";
      }
*/

      
      // Let's say the theme is equal to light
      let currentTheme = "light";
      // If the body contains the .dark-theme class...
      if (theme.getAttribute("href") == themeURLRoot + "/dark-theme.min.css") {
        // ...then let's make the theme dark
        currentTheme = "dark";
      }
      // Then save the choice in localStorage
      localStorage.setItem("theme", currentTheme);
    });

  }
})
