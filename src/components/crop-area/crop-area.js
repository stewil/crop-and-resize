(function() {
    module.exports = CropArea();

    function CropArea() {

        var _eventsQueue   = require('../events-queue/events-queue.js'),
            _utils         = require('../utils/utils.js'),
            _settings      = require('../settings/settings.js'),
            _information   = require('../information/information.js'),
            _this          = {},
            _hasInit       = false,
            _onChangeQueue = [],
            _image         = new Image(),
            _canvasElement,
            _source,
            _canvas,
            _context;

        /*========================================================================
            PUBLIC
        ========================================================================*/

        _this.changeFile = changeFile;
        _this.onChange   = storeOnChange;

        return _this;

        /*========================================================================
            PRIVATE
        ========================================================================*/

        function init(){
            createCanvasElement();
            bindListeners();
            _hasInit = true;
        }

        function changeFile(file){
            if(!_hasInit){
                init();
            }
            _utils.fileToBase64(file, function (src) {
                _information.updateProperty('originalImage', {
                    src  : src,
                    file : _utils.base64toBlob(src)
                });
                _image.src = src;
            });
        }

        function bindListeners(){
            _image.onload = onCanvasSrcLoad;
            _eventsQueue.subscribe('resize', window, cacheCanvasDimensions);
        }

        function createCanvasElement(){

            var cropArea    = _settings.cropArea,
                tagName;

            if(cropArea){
                tagName = cropArea.tagName.toLocaleLowerCase();

                if(_settings.cropArea && !_utils.isClosedElement(_settings.cropArea)){
                    if(tagName !== "canvas"){
                        _canvasElement = document.createElement('canvas');
                        cropArea.appendChild(_canvasElement);
                    }else{
                        _canvasElement = _settings.cropArea;
                    }

                    _context        =   _canvasElement.getContext('2d');
                }
            }
        }

        function onCanvasSrcLoad(e){

            var canvasParams;

            _information.updateProperty('originalImage', {
                width  : this.width,
                height : this.height
            });

            //Without a set size on the canvas the image data context with render at it's default dimensions of 300x150.
            //CSS will then scale the scaled down image data up to the size that it calculates for the DOM.
            _canvasElement.width    = _canvasElement.offsetWidth;
            _canvasElement.height   = _canvasElement.offsetHeight;

            _source           = {};
            _canvas           = {};

            _source['width']  = this.width;
            _source['height'] = this.height;

            _canvas['width']  = _canvasElement.width;
            _canvas['height'] = _canvasElement.height;

            canvasParams  = measureContext();

            _canvas['widthRatio']   = (canvasParams.dWidth / _canvas['width']);
            _canvas['heightRatio']  = (canvasParams.dHeight / _canvas['height']);

            _context.clearRect(0, 0, _canvas.width, _canvas.height);
            _context.drawImage(_image,
                canvasParams.sx,
                canvasParams.sy,
                canvasParams.sWidth,
                canvasParams.sHeight,
                canvasParams.dx,
                canvasParams.dy,
                canvasParams.dWidth,
                canvasParams.dHeight
            );
            cacheCanvasDimensions();
            notify();
        }

        function storeOnChange(fn){
            _onChangeQueue.push(fn);
        }

        function notify(){
            var totalSubscribers= _onChangeQueue.length;
            while(totalSubscribers--){
                if(_onChangeQueue[totalSubscribers] && typeof _onChangeQueue[totalSubscribers] === 'function'){
                    _onChangeQueue[totalSubscribers]({
                        source : _source,
                        canvas : _canvas,
                        context: _context
                    });
                }
            }
        }

        function cacheCanvasDimensions(){
            if(_canvasElement && _canvas){
                var canvasBounding = _canvasElement.getBoundingClientRect();
                _canvas['top']     = canvasBounding.top;
                _canvas['left']    = canvasBounding.left;
                _canvas['cWidth']  = _canvasElement.offsetWidth;
                _canvas['cHeight'] = _canvasElement.offsetHeight;
            }
        }

        function measureContext(){
            var hRatio   =   _canvas.width  / _source.width,
                vRatio   =   _canvas.height  / _source.height,
                ratio    =   Math.min( hRatio, vRatio);

            return{
                sx:      0,
                sy:      0,
                sWidth:  _source.width,
                sHeight: _source.height,
                dx:      (_canvas.width - _source.width * ratio ) / 2,
                dy:      (_canvas.height - _source.height * ratio ) / 2,
                dWidth:  _source.width * ratio,
                dHeight: _source.height * ratio
            }
        }
    }
})();