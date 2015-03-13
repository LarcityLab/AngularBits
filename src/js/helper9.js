if (typeof(console) == "undefined") { console = {}; } 
if (typeof(console.log) == "undefined") { console.log = function() { return 0; }; };
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
if(typeof jQuery !== "undefined")
    jQuery.support.placeholder = (function () {
        var i = document.createElement('input');
        return 'placeholder' in i;
    })();
