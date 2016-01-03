(function(){
    module.exports = utils;

    function utils(){

        var utils = {};

        utils.bytesToSize     = bytesToSize;
        utils.base64toBlob    = base64toBlob;
        utils.ifValue         = ifValue;
        utils.isClosedElement = isClosedElement;
        utils.fileToBase64    = fileToBase64;

        this.utils = utils;

        return utils;

        function bytesToSize(bytes) {
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            if (bytes == 0) return '0 Byte';
            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
            return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
        }

        function fileToBase64(file, fn){
            var reader = new FileReader();
            reader.onload = onReaderLoad;
            reader.readAsDataURL(file);
            function onReaderLoad(e){
                fn(e.target.result);
            }
        }

        function base64toBlob(base64String){
            var blobBin =   atob(base64String.split(',')[1]),
                array   =   [];

            for(var i = 0; i < blobBin.length; i++) {
                array.push(blobBin.charCodeAt(i));
            }

            return new Blob([new Uint8Array(array)], {type: 'image/png'});
        }

        function ifValue(value){

            return {
                isElement:isElement()
            };

            function isElement(){
                return typeof HTMLElement === "object" ? value instanceof HTMLElement : value && typeof value === "object" && value !== null && value.nodeType === 1 && typeof value.nodeName==="string";
            }
        }

        function isClosedElement(element){
            var closedElements = [
                'area',
                'base',
                'br',
                'col',
                'command',
                'embed',
                'hr',
                'img',
                'input',
                'keygen',
                'link',
                'meta',
                'param',
                'source',
                'track',
                'wbr'
                ],
                closedRegex = new RegExp("^" + closedElements.join("$|^") + "$", 'gi');

            return (closedRegex.test(element.tagName));
        }
    }

})();