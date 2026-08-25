(function () {
    var storageKey = "todoTheme";

    function getTheme() {
        return localStorage.getItem(storageKey) || "light";
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem(storageKey, theme);

        var button = document.getElementById("themeToggle");
        if (button) {
            button.innerText = theme == "dark" ? "Light" : "Dark";
            button.setAttribute("title", theme == "dark" ? "Light theme" : "Dark theme");
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        applyTheme(getTheme());

        var button = document.getElementById("themeToggle");
        if (button) {
            button.addEventListener("click", function () {
                var nextTheme = getTheme() == "dark" ? "light" : "dark";
                applyTheme(nextTheme);
            });
        }
    });
})();
