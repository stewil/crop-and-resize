'use strict';
//version 0.1.0 (2015/11/06)
var GulpConfig = (function () {
    function GulpConfig() {

        this.dist                           =       './dist/';
        this.source                         =       './src/';
        this.bowerFilesSettings             =       {};

        this.scss = [
            this.source + "*.scss",
            this.source + "**/*.scss"
        ];

        this.images = [
            this.source + 'assets/**/*.gif',
            this.source + 'assets/**/*.png',
            this.source + 'assets/**/*.jpg',
            this.source + 'assets/**/*.jpeg'
        ];

        this.html = [
            this.source + "**/*.html",
            "!" + this.source + "index.html"
        ];

        this.index = [
            this.source + "index.html"
        ];

        this.application = this.source + 'app.js';

        this.javascriptModules = [
            this.source + 'app.js',
            this.source + 'classes/*.js'
        ];

    }
    return GulpConfig;
})();
module.exports = GulpConfig;