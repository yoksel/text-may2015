console.clear();

var s = Snap();
var sMaxX = 1024;
var sMaxY = 640;
var viewBoxList = [0, 0, sMaxX, sMaxY];
s.attr({
    viewBox: viewBoxList
});

var gLines = s.g();
var gText = s.g();
var mask = s.mask();
var patt;

var pSize = 1000;
var maxLines = 16;
var maxLinesDouble = maxLines * 2;
var lineStep = pSize / maxLines;
var pathDur = 1500;
var delay = 250;

var colorSteps = maxLines / 2;
var colors = ['purple',
              'crimson',
              'orangered',
              'orange',
              'gold',
              'yellowgreen',
              'steelblue',
              'teal',
              'purple'
             ]

var lineLength = Math.sqrt( Math.pow( pSize, 2 ) * 2);

//------------------------------------------------

var lineObj = function () {
    var d = 'M' + [pSize, 0, 0, pSize];
    var path = s.path(d);
    var pos = 0;
    var addMask = false;

    this.init = function ( params ) {
        pos = params.pos;
        var strokeW = params.strokeW;
        var strokeColor = params.color || 'hotpink'
        var offsetX = params.offsetX || 0;
        var x = pSize - lineStep * (pos + .5) + offsetX;
        var translateParams = [x, 0];

        var pathDelay = params.delay || delay;
        var dashArray = lineLength;
        addMask = params.addMask || false;

        path.attr({
            transform: 'translate(' + translateParams + ')',
            'stroke-width': strokeW,
            stroke: strokeColor,
            'stroke-linecap': 'square',
            'stroke-dashoffset': lineLength,
            'stroke-dasharray': dashArray
        });


        gLines.add(path);

        //console.log('Line Created');

        setTimeout(pathAnim, (maxLinesDouble - pos) * pathDelay);

    }// Init

    function runNextAnim() {
        if ( addMask ) {
            // Why 0?
            if ( pos == 0) {
                createMask();
            }
        }
    }
    function pathAnim() {

        path.animate({
            'stroke-dashoffset': '0'
            },
            pathDur,
            runNextAnim
            );
    }

}// lineObj

//------------------------------------------------

function createLines( params ) {

    var strokeW = params.strokeW;

    for ( var i = 0; i < maxLinesDouble; i++ ) {
        var line = new lineObj;
        var color = params.color || colors[i % colorSteps];

        line.init({
            pos: i,
            strokeW: params.strokeW,
            offsetX: params.offsetX,
            delay: params.delay,
            addMask: params.addMask,
            color: color,
        });
    }
}

//------------------------------------------------

function createPattern() {

    var rect = s.rect(0,0, pSize, pSize);
    rect.attr({
        /*stroke: 'yellowgreen',
        'stroke-width': 2,*/
        fill: 'white',
    });

    gLines.add(rect);

    createLines({
        strokeW: lineStep / 1.4
        });

    createLines({
        strokeW: 2,
        color: '#002',
        offsetX: lineStep / 2 + 7,
        delay: 300,
        addMask: true
        });

    patt = gLines.toPattern(0,0, pSize, pSize);

}

//------------------------------------------------

var textObj = function () {

    var textDur = 2000;
    var dashoffset = 1300;
    var textGInit = s.g();
        var text1 = s.text('50%','34%','Оживляем');
        var text2 = s.text('50%','61%','текст');

    text1.attr({
       dy: '.3em',
       'font-size': '26vmin'
    });
    text2.attr({
       dy: '.3em'
    });

    textGInit.add(text1, text2);

    textGInit.attr({
        'text-anchor': 'middle',
        'font': '51vmin/1 Russo One, Impact',
        'letter-spacing': '.02em',
        fill: 'white',
        stroke: '#000',
        'stroke-width': 3,
        'stroke-dasharray': dashoffset,
        'stroke-dashoffset': dashoffset
    });

    var textGFill = textGInit.clone();

    textGInit.attr({
        transform: 'translate(7,7)'
    });

    gText.add(textGInit, textGFill);

    this.init = function () {

        textGFill.animate({
            'stroke-dashoffset': 0
            },
            textDur,
            setTextStroke);
    }

    function setTextStroke () {
        setTextFill();

        textGInit.animate({
            'stroke-dashoffset': 0
            },
            textDur
            );
    }

    function setTextFill () {
        createPattern();
        textGFill.attr({
            fill: patt
        });
    }
}

//------------------------------------------------

function createText() {
    var text = new textObj;
    text.init();
}

createText();

//------------------------------------------------

var maskObj = function () {

    var maskShape = s.ellipse('50%', '50%', sMaxX / 2, sMaxY / 2);
    maskShape.attr({
        fill: '#FFF'
    });

    mask.add(maskShape);

    gText.attr({
        mask: mask
    });

    var minR = sMaxY * .1;
    var midR = sMaxY * .4;

    var currentStep = 0;
    var steps = [
        {rx: minR, ry: minR},
        {rx: midR, ry: midR},
        {rx: 0, ry: 0}
    ];
    var maskDur = 300;

    this.init = function () {
       maskAnim();
    }

    function maskAnim () {

        if ( currentStep == steps.length ) {
            setTimeout(reRun, 1000);
            return;
        }

        maskShape.animate(
            steps[currentStep],
            maskDur,
            maskAnim);
        currentStep++;
    }
}

//------------------------------------------------

function createMask() {
    var mask = new maskObj;
    mask.init();
}

//------------------------------------------------

function reRun() {

    gLines.remove();
    gText.remove();
    mask.remove();
    patt.remove();

    gLines = s.g();
    gText = s.g();
    mask = s.mask();

    createText();
}

//------------------------------------------------

var introSlide = document.querySelector('.intro');
introSlide.appendChild(s.node);
