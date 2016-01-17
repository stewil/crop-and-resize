(function(){

    var utils           = utilsModule(),
        div             = document.createElement('div'),
        closedElements  = [],
        closedElementTagNames = [
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
        ];

    closedElementTagNames.forEach(function(tagName, index){
        closedElements.push(document.createElement(tagName))
    });

    describe("Utils Module", function(){
        it("'ifValue().isElement' returns true only when element an element is provided.", function(){
            expect(utils.ifValue(div).isElement).toEqual(true);
            expect(utils.ifValue(true).isElement).toEqual(false);
            expect(utils.ifValue('true').isElement).toEqual(false);
            expect(utils.ifValue({'object':true}).isElement).toEqual(false);
            expect(utils.ifValue([true]).isElement).toEqual(false);
            expect(utils.ifValue(1).isElement).toEqual(false);
        });

        it("'isClosedElement()' will correctly identify closed elements", function(){
            closedElements.forEach(function(element){
                expect(utils.isClosedElement(element)).toEqual(true);
            });
        });
    });
})();