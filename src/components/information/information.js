(function(){
    "use strict";

    module.exports = Information;

    function Information(){

        this.information = {
            croppedImage :imageInfoObject(),
            originalImage :imageInfoObject()
        };

        function imageInfoObject(){
            return{
                src      : "",
                file     : null,
                fileSize : 0,
                width    : 0,
                height   : 0
            }
        }
    }
})();