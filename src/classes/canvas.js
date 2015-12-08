(function() {
    module.exports = CanvasDependencies;

    function CanvasDependencies(_element, attributes, cropWindow) {
        return function bindCanvas() {
            var self = this;

            self['canvas'] = {};
            self.canvas['element'] = document.createElement('canvas');
            self.canvas['context'] = self.canvas.element.getContext('2d');

            var parent  = _element.parentElement,
                image   = new Image();

            image.onload    =   onCanvasImageLoad;
            image.src       =   self.original.url;

            function onCanvasImageLoad(){
                self.original['width']  =   this.width;
                self.original['height'] =   this.height;

                self.canvas['width']    =   self['canvas'].element.width;
                self.canvas['height']   =   self['canvas'].element.height;

                var canvasParams = measurements(self.original, self.canvas);

                if(attributes['target']){
                    attributes['target'].appendChild(self.canvas.element)
                }else{
                    parent.insertBefore(self.canvas.element, element);
                }

                self.canvas.context.clearRect(0, 0, self.canvas['width'], self.canvas['height']);
                self.canvas.context.drawImage(image,
                    canvasParams.sx,
                    canvasParams.sy,
                    canvasParams.sWidth,
                    canvasParams.sHeight,
                    canvasParams.dx,
                    canvasParams.dy,
                    canvasParams.dWidth,
                    canvasParams.dHeight
                );

                cropWindow((attributes['target'] || parent), self.canvas);

                function measurements(image, canvas){
                    var hRatio      =   canvas.width  / image.width,
                        vRatio      =   canvas.height  / image.height,
                        ratio       =   Math.min ( hRatio, vRatio);

                    return {
                        sx:         0,
                        sy:         0,
                        sWidth:     image.width,
                        sHeight:    image.height,
                        dx:         (canvas['width'] - image['width'] * ratio ) / 2,
                        dy:         (canvas['height'] - image['height'] * ratio ) / 2,
                        dWidth:     image.width * ratio,
                        dHeight:    image.height * ratio
                    }
                }

            }
        }
    }
})();