/* Handles basic UI navigation elements */

// DISCLAIMER: this is a singleton class
export default class UI {
    static instance = new UI();

    constructor() {
        if (UI.instance != null)
            console.log("UI is singleton and has already been initiated! Please use UI.getInstance().");
    }

    static getInstance() {
        return UI.instance;
    }

    static init() {
        // set tabs to invisible
        document.getElementById("camUI").setAttribute("style", "display: none");
        document.getElementById("settingsUI").setAttribute("style", "display: none");

        // create event listeners for the main ui tabs
        document.getElementById("building").addEventListener("click", UI.instance.handleTabChange);
        document.getElementById("camera").addEventListener("click", UI.instance.handleTabChange);
        document.getElementById("settings").addEventListener("click", UI.instance.handleTabChange);
        
        // create events listeners for the individual dropdown arrows
        document.getElementById("check01CSS").addEventListener("click", UI.instance.handleDropdownIcon);
        document.getElementById("check02CSS").addEventListener("click", UI.instance.handleDropdownIcon);
        document.getElementById("check03CSS").addEventListener("click", UI.instance.handleDropdownIcon);
        document.getElementById("check04CSS").addEventListener("click", UI.instance.handleDropdownIcon);
        document.getElementById("check09CSS").addEventListener("click", UI.instance.handleDropdownIcon);
    }

    handleTabChange(_event) {
        // get all tabs
        let children = document.getElementById("UIElements").children;

        // set all tabs to invisible
        for (let i = 0; i < children.length; i++)
            document.getElementById(children[i].id).setAttribute("style", "display: none");

        // set selected tab to visible
        document.getElementById(_event.target.name).setAttribute("style", "visibility: visible");
    }

    handleDropdownIcon(_event) {
        // get the icon that has to be changed
        let icon = document.getElementById(_event.target.children[0].id);

        // change the icon
        if (icon.className == "dropdown")
            icon.className = "dropdownOpen";
        else
            icon.className = "dropdown";
    }
}