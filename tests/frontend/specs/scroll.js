describe('scroll when focus line is out of viewport', function () {
  before(function (done) {
    helper.newPad(function(){
      cleanPad(function(){
        createPadWithSeveralLines(function(){
          resizeEditor();
          done();
        });
      });
    });
    this.timeout(20000);
  });

  context('when user presses any arrow keys on a line above the viewport', function(){
    context('and scroll percentage config is set to 0.2 on settings.json', function(){
      var focusLine = 10;
      before(function (done) {
        setScrollPercentageWhenFocusLineIsOutOfViewport(0.2);
        scrollEditorToBottomOfPad();

        placeCaretInTheBeginningOfLine(focusLine, function(){ // place caret in the 10th line
          // warning: even pressing right arrow, the caret does not change of position
          pressAndReleaseRightArrow();
          done();
        });
      });

      it('keeps the focus line scrolled 20% from the top of the viewport', function (done) {
        // default behavior is to put the line in the top of viewport, but as
        // scrollPercentageWhenFocusLineIsOutOfViewport is set to 0.2, we have an extra 20% of lines scrolled
        // (2 lines, which are the 20% of the 10 that are visible on viewport)
        var firstLineOfViewport = getFirstLineVisibileOfViewport();
        var lineScrolledToTheMiddleOfViewport = firstLineOfViewport + 2 === focusLine;
        expect(lineScrolledToTheMiddleOfViewport).to.be(true);
        done();
      });
    });
  });

  context('when user presses any arrow keys on a line bellow the viewport', function(){
    context('and scroll percentage config is set to 0.7 on settings.json', function(){
      var focusLine = 50;
      before(function (done) {
        setScrollPercentageWhenFocusLineIsOutOfViewport(0.7);

        // firstly, scroll to make the focusLine visible. After that, scroll to make it out of viewport
        scrollEditorToTopOfPad();
        placeCaretAtTheEndOfLine(focusLine); // place caret in the 50th line
        setTimeout(function() {
          // warning: even pressing right arrow, the caret does not change of position
          pressAndReleaseLeftArrow();
          done();
        }, 1000);
      });

      it('keeps the focus line scrolled 70% from the bottom of the viewport', function (done) {
        // default behavior is to put the line in the top of viewport, but as
        // scrollPercentageWhenFocusLineIsOutOfViewport is set to 0.7, we have an extra 70% of lines scrolled
        // (7 lines, which are the 70% of the 10 that are visible on viewport)
        var lastLineOfViewport = getLastLineVisibleOfViewport();
        var lineScrolledSevenLinesFromTheBottomOfViewport = lastLineOfViewport - 7 === focusLine;
        expect(lineScrolledSevenLinesFromTheBottomOfViewport).to.be(true);
        done();
      });
    });
  });

  context('when user edits the last line of viewport', function(){
    context('and scroll percentage config is set to 0 on settings.json', function(){
      var lastLineOfViewportBeforeEnter = 10;
      before(function () {
        // the default value
        setScrollPercentageWhenFocusLineIsOutOfViewport(0);

        // make sure the last line on viewport is the 10th one
        scrollEditorToTopOfPad();
        placeCaretAtTheEndOfLine(lastLineOfViewportBeforeEnter);
        pressEnter();
      });

      it('keeps the focus line on the bottom of the viewport', function (done) {
        var lastLineOfViewportAfterEnter = getLastLineVisibleOfViewport();
        var scrolledOneLineDown = lastLineOfViewportAfterEnter === lastLineOfViewportBeforeEnter + 1;
        expect(scrolledOneLineDown).to.be(true);
        done();
      });
    });

    context('and scrollPercentageWhenFocusLineIsOutOfViewport is set to 0.3', function(){ // this value is arbitrary
      var lastLineOfViewportBeforeEnter = 10;
      before(function () {
        setScrollPercentageWhenFocusLineIsOutOfViewport(0.3);

        // make sure the last line on viewport is the 10th one
        scrollEditorToTopOfPad();
        placeCaretAtTheEndOfLine(lastLineOfViewportBeforeEnter);
        pressEnter();
      });

      it('scrolls 30% of viewport up', function (done) {
        var lastLineOfViewportAfterEnter = getLastLineVisibleOfViewport();

        // default behavior is to scroll one line at the bottom of viewport, but as
        // scrollPercentageWhenFocusLineIsOutOfViewport is set to 0.3, we have an extra 30% of lines scrolled
        // (3 lines, which are the 30% of the 10 that are visible on viewport)
        var scrolledThreeLinesDown = lastLineOfViewportAfterEnter === lastLineOfViewportBeforeEnter + 3;
        expect(scrolledThreeLinesDown).to.be(true);
        done();
      });
    });

    context('and it is set to a value that overflow the interval [0, 1]', function(){
      var lastLineOfViewportBeforeEnter = 10;
      before(function(){
        var scrollPercentageWhenFocusLineIsOutOfViewport = 1.5;
        scrollEditorToTopOfPad();
        placeCaretAtTheEndOfLine(lastLineOfViewportBeforeEnter);
        setScrollPercentageWhenFocusLineIsOutOfViewport(scrollPercentageWhenFocusLineIsOutOfViewport);
        pressEnter();
      });

      it('keeps the default behavior of moving the focus line on the bottom of the viewport', function (done) {
        var lastLineOfViewportAfterEnter = getLastLineVisibleOfViewport();
        var scrolledOneLineDown = lastLineOfViewportAfterEnter === lastLineOfViewportBeforeEnter + 1;
        expect(scrolledOneLineDown).to.be(true);
        done();
      });
    });
  });

  context('when user edits a line above the viewport', function(){
    context('and scroll percentage config is set to 0 on settings.json', function(){
      var focusLine = 10;
      before(function () {
        // the default value
        setScrollPercentageWhenFocusLineIsOutOfViewport(0);

        // firstly, scroll to make the focusLine visible. After that, scroll to make it out of viewport
        scrollEditorToTopOfPad();
        placeCaretAtTheEndOfLine(focusLine); // place caret in the 10th line
        scrollEditorToBottomOfPad();
        pressBackspace(); // edit the line where the caret is, which is above the viewport
      });

      it('keeps the focus line on the top of the viewport', function (done) {
        var firstLineOfViewportAfterEnter = getFirstLineVisibileOfViewport();
        var keepLineEditedOnTopOfViewport = firstLineOfViewportAfterEnter === focusLine;
        expect(keepLineEditedOnTopOfViewport).to.be(true);
        done();
      });
    });

    context('and scrollPercentageWhenFocusLineIsOutOfViewport is set to 0.2', function(){ // this value is arbitrary
      var focusline = 50;
      before(function () {
        // we force the line edited to be above the top of the viewport
        setScrollPercentageWhenFocusLineIsOutOfViewport(0.2); // set scroll jump to 20%
        scrollEditorToTopOfPad();
        placeCaretAtTheEndOfLine(focusline);
        scrollEditorToBottomOfPad();
        pressBackspace(); // edit line
      });

      it('scrolls 20% of viewport down', function (done) {
        // default behavior is to scroll one line at the top of viewport, but as
        // scrollPercentageWhenFocusLineIsOutOfViewport is set to 0.2, we have an extra 20% of lines scrolled
        // (2 lines, which are the 20% of the 10 that are visible on viewport)
        var firstLineVisibileOfViewport = getFirstLineVisibileOfViewport();
        var focusLineIsTwoLinesFromTop = focusline === firstLineVisibileOfViewport + 2;
        expect(focusLineIsTwoLinesFromTop).to.be(true);
        done();
      });
    });
  });

  context('when user places the caret at the last line visible of viewport', function(){
    var focusLine = 9;
    context('and scroll percentage config is set to 0 on settings.json', function(){
      before(function (done) {
        // reset to the default value
        setScrollPercentageWhenFocusLineIsOutOfViewport(0);

        placeCaretInTheBeginningOfLine(0, function(){ // reset caret position
          scrollEditorToTopOfPad();
          placeCaretInTheBeginningOfLine(focusLine, done); // place caret in the 9th line
        });

      });

      it('does not scroll', function(done){
        setTimeout(function() {
          var lastLineOfViewport = getLastLineVisibleOfViewport();
          var lineDoesNotScroll = lastLineOfViewport === focusLine;
          expect(lineDoesNotScroll).to.be(true);
          done();
        }, 1000);
      });
    });
    context('and scroll percentage config is set to 0.5 on settings.json', function(){
      before(function (done) {
        setScrollPercentageWhenFocusLineIsOutOfViewport(0.5);
        scrollEditorToTopOfPad();
        placeCaretInTheBeginningOfLine(0, function(){ // reset caret position
          // this timeout inside a callback is ugly but it necessary to give time to aceSelectionChange
          // realizes that the selection has been changed
          setTimeout(function() {
            placeCaretInTheBeginningOfLine(focusLine, done); // place caret in the 9th line
          }, 1000);
        });
      });

      it('scrolls line to 50% of the viewport', function(done){
        helper.waitFor(function(){
          var lastLineOfViewport = getLastLineVisibleOfViewport();
          var lastLinesScrolledFiveLinesUp = lastLineOfViewport - 5 === focusLine;
          return lastLinesScrolledFiveLinesUp;
        }).done(done);
      });
    });
  });

  /* ********************* Helper functions/constants ********************* */
  var TOP_OF_PAGE = 0;
  var BOTTOM_OF_PAGE = 5000; // we use a big value to force the page to be scrolled all the way down
  var LINES_OF_PAD = 100;
  var ENTER = 13;
  var BACKSPACE = 9;
  var LEFT_ARROW = 37;
  var RIGHT_ARROW = 39;
  var LINES_ON_VIEWPORT = 10;

  var cleanPad = function(callback) {
    var inner$ = helper.padInner$;
    var $padContent = inner$("#innerdocbody");
    $padContent.html("");

    // wait for Etherpad to re-create first line
    helper.waitFor(function(){
      var lineNumber = inner$("div").length;
      return lineNumber === 1;
    }, 2000).done(callback);
  };

  var createPadWithSeveralLines = function(done) {
    var line = "<span>a</span><br>";
    var $firstLine = helper.padInner$('div').first();
    var lines = line.repeat(LINES_OF_PAD); //arbitrary number, we need to create lines that is over the viewport
    $firstLine.html(lines);

    helper.waitFor(function(){
      var linesCreated = helper.padInner$('div').length;
      return linesCreated === LINES_OF_PAD;
    }, 4000).done(done);
  };

  // resize the editor to make the tests easier
  var resizeEditor = function() {
    var chrome$ = helper.padChrome$;
    chrome$("#editorcontainer").css("height", getSizeOfViewport());
  };

  var getSizeOfViewport = function() {
    return getLinePositionOnViewport(LINES_ON_VIEWPORT + 1) - getLinePositionOnViewport(0);
  };

  var scrollPageTo = function(value) {
    var outer$ = helper.padOuter$;
    var $ace_outer = outer$('#outerdocbody').parent();
    $ace_outer.parent().scrollTop(value);
  };

  var scrollEditorToTopOfPad = function() {
    scrollPageTo(TOP_OF_PAGE);
  };

  var scrollEditorToBottomOfPad = function() {
    scrollPageTo(BOTTOM_OF_PAGE);
  };

  var getLine = function(lineNum) {
    var inner$ = helper.padInner$;
    var $line = inner$("div").eq(lineNum);
    return $line;
  };

  var placeCaretAtTheEndOfLine = function(lineNum) {
    var $targetLine = getLine(lineNum);
    var lineLength = $targetLine.text().length;
    helper.selectLines($targetLine, $targetLine, lineLength, lineLength);
  };

  var placeCaretInTheBeginningOfLine = function(lineNum, cb) {
    var $targetLine = getLine(lineNum);
    helper.selectLines($targetLine, $targetLine, 0, 0);
    helper.waitFor(function() {
      var $lineWhereCaretIs = getLineWhereCaretIs();
      if($targetLine.get(0) === $lineWhereCaretIs.get(0)) debugger
      return $targetLine.get(0) === $lineWhereCaretIs.get(0);
    }).done(cb);
  };

  var getLineWhereCaretIs = function() {
    var inner$ = helper.padInner$;
    var nodeWhereCaretIs = inner$.document.getSelection().anchorNode;
    var $lineWhereCaretIs = $(nodeWhereCaretIs).closest("div");
    return $lineWhereCaretIs;
  };

  var getFirstLineVisibileOfViewport = function() {
    return  _.find(_.range(0, LINES_OF_PAD - 1), isLineOnViewport);
  };

  var getLastLineVisibleOfViewport = function() {
    return  _.find(_.range(LINES_OF_PAD - 1, 0, -1), isLineOnViewport);
  };

  var pressKey = function(keyCode){
    var inner$ = helper.padInner$;
    var evtType;
    if(inner$(window)[0].bowser.firefox || inner$(window)[0].bowser.modernIE){ // if it's a mozilla or IE
      evtType = "keypress";
    }else{
      evtType = "keydown";
    }
    var e = inner$.Event(evtType);
    e.keyCode = keyCode;
    e.which = keyCode; // etherpad listens to 'which'
    inner$("#innerdocbody").trigger(e);
  };

  var releaseKey = function(keyCode){
    var inner$ = helper.padInner$;
    var evtType = "keyup";
    var e = inner$.Event(evtType);
    e.keyCode = keyCode;
    e.which = keyCode; // etherpad listens to 'which'
    inner$("#innerdocbody").trigger(e);
  };

  var pressEnter = function() {
    pressKey(ENTER);
  };

  var pressBackspace = function() {
    pressKey(BACKSPACE);
  };

  var pressAndReleaseRightArrow = function() {
    pressKey(RIGHT_ARROW);
    releaseKey(RIGHT_ARROW);
  };

  var pressAndReleaseLeftArrow = function() {
    pressKey(LEFT_ARROW);
    releaseKey(LEFT_ARROW);
  };

  var isLineOnViewport = function(lineNumber) {
    // in the function scrollNodeVerticallyIntoView from ace2_inner.js, iframePadTop is used to calculate
    // how much scroll is needed. Although the name refers to padding-top, this value is not set on the
    // padding-top.
    var iframePadTop = 8;
    var inner$ = helper.padInner$;
    var outer$ = helper.padOuter$;
    var $line = getLine(lineNumber);
    var linePosition = $line.get(0).getBoundingClientRect();
    var scrollTopFirefox = outer$('#outerdocbody').parent().scrollTop(); // works only on firefox
    var scrolltop = outer$('#outerdocbody').scrollTop() || scrollTopFirefox;

    // position relative to the current viewport
    var linePositionTopOnViewport = linePosition.bottom - scrolltop + iframePadTop;
    var linePositionBottomOnViewport = linePosition.bottom - scrolltop;
    var lineAboveViewportTop = linePositionTopOnViewport <= 0;
    var lineBelowViewportBottom = linePositionBottomOnViewport > getClientHeight();

    return !(lineAboveViewportTop || lineBelowViewportBottom);
  };

  var getClientHeight = function () {
    var outer$ = helper.padOuter$;
    var $ace_outer = outer$('#outerdocbody').parent();
    var ace_outerHeight = $ace_outer.get(0).clientHeight;
    var ace_outerPaddingTop = getIntValueOfCSSProperty($ace_outer, "padding-top");

    var clientHeight = ace_outerHeight - ace_outerPaddingTop;

    return clientHeight;
  };

  var getIntValueOfCSSProperty = function($element, property){
    var valueString = $element.css(property);
    return parseInt(valueString) || 0;
  };

  var setScrollPercentageWhenFocusLineIsOutOfViewport = function(value) {
    helper.padChrome$.window.clientVars.scrollWhenFocusLineIsOutOfViewport.percentage = value;
  };

  var getLinePositionOnViewport = function(lineNumber) {
    var $line = getLine(lineNumber);
    var linePosition = $line.get(0).getBoundingClientRect();

    var outer$ = helper.padOuter$;
    var scrollTopFirefox = outer$('#outerdocbody').parent().scrollTop(); // works only on firefox
    var scrolltop = outer$('#outerdocbody').scrollTop() || scrollTopFirefox;

    // position relative to the current viewport
    return linePosition.top - scrolltop;
  };
});

