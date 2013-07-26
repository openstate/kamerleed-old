window.Kamerleed = window.Kamerleed || {};
window.Kamerleed.interval = 5000;
window.Kamerleed.loopingEnabled = true;

window.Kamerleed.refresh = function() {
    $('#marker').fadeOut(500, function() {
        $('#marker').removeClass('block1 block2 block3 block4 block5 block6 block7 blockundefined').addClass('block' + window.Kamerleed.details.mp.blockId);
        $('#marker img').attr('src', 'http://www.tweedekamer.nl' + window.Kamerleed.details.mp.photo);
        $('#marker p.sentence').text(window.Kamerleed.details.sentence);
        $('#marker').fadeIn();        
    });
};

window.Kamerleed.update = function() {
    $.get('/json/details', function (data) {
        window.Kamerleed.details = data;
        window.Kamerleed.refresh();
    });
};

window.Kamerleed.looper = function() {
    window.Kamerleed.update();
    if (window.Kamerleed.loopingEnabled) {
        setTimeout(function() {
            window.Kamerleed.looper();
        }, window.Kamerleed.interval);
    }
};

$(document).ready(function() {
    console.log('kamerleed');
    setTimeout(function() {
        window.Kamerleed.looper();
    }, window.Kamerleed.interval);
});