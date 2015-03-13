angular.module('com.larcity.filter.preview',[])
        .filter('preview', ['$extensionService', function(ex) {
            return function( text, limit ) {
                //ex.log(arguments, '[module.filter.previewText]'); // Works perfectly!!
                //console.log("Filter arguments:");
                //console.log(arguments);
                if(!limit) limit=25;
                if(!text) {
                    return '';
                } else if(text.length>limit) {
                    return text.substring(0, limit) + "...";
                } else {
                    return text;
                }
            };
        }]);