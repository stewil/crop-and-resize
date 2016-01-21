(function(){
    "use strict";

    module.exports = Information();

    function Information(){

        var _this = {
            croppedImage :imageInfoObject(),
            originalImage :imageInfoObject()
        };

        return _this;

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