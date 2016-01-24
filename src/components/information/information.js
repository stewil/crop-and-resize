(function(){
    "use strict";

    module.exports = Information();

    function Information(){

        var _this  = {},
            _utils = require('../utils/utils.js'),
            _data  = {
                croppedImage  : imageInfoObject(),
                originalImage : imageInfoObject()
            };

        _this.getImageData   = getImageData;
        _this.updateDataFor  = updateDataFor;
        _this.updateProperty = updateProperty;
        _this.resetData      = resetData;

        return _this;

        function getImageData(){
            return {
                croppedImage  : _data.croppedImage,
                originalImage : _data.originalImage
            }
        }

        function updateDataFor(property){
            var data = _data[property];
            if(data && data.src !== ""){
                data.file = _utils.base64toBlob(data.src);
            }
        }

        function resetData(){
            _data = {
                croppedImage  : imageInfoObject(),
                originalImage : imageInfoObject()
            };
        }

        function updateProperty(property, values){
            if(_data[property]){
                for(var key in _data[property]){
                    if(values[key]){
                        _data[property][key] = values[key];
                    }
                }
            }
        }

        function imageInfoObject(){
            return{
                src      : "",
                file     : null,
                size     : 0,
                type     : "",
                name     : "",
                width    : 0,
                height   : 0
            }
        }
    }
})();