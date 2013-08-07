window.Kamerleed = window.Kamerleed || {
    app: {
        title: 'Kamerleed'
    },
};
window.Kamerleed.interval = 5000;
window.Kamerleed.loopingEnabled = false;

window.Kamerleed.init = function() {
    // detemine what to load
    if (window.location.pathname == '/') {
        // get random member
        console.log('homepage, should get a random member now ...');
        window.Kamerleed.update();
    } else if (person_match = window.location.pathname.match(/^\/persons\/([a-zA-z\-]+)\/?/)) {
        var slug = person_match[1];
        console.log('Politician page, should fetch data for ' + slug + ' now ...');
        window.Kamerleed.load_person(slug);
    } else {
        console.log('At a totally random path ...');
    }
};

window.Kamerleed.load_person = function(slug) {
    $.get('/persons/' + slug + '/json', function (data) {
        window.Kamerleed.person = data;
        window.Kamerleed.refresh_full_interface();
        // loop the interface
        window.Kamerleed.looper();
    });
};

window.Kamerleed.refresh_full_interface = function() {
    // do interface refresh here
    document.title = sprintf("%s - %s", window.Kamerleed.app.title, window.Kamerleed.person.profile.name);
    window.Kamerleed.refresh_marker();
    console.log('Interface refreshed!'); 
};

window.Kamerleed.refresh_marker = function() {
    $('#marker').fadeOut(500, function() {
        $('#marker').removeClass('block1 block2 block3 block4 block5 block6 block7 blockundefined').addClass('block' + window.Kamerleed.person.profile.block);
        $('#marker div.avatar').attr('style', 'background: url(' + window.Kamerleed.person.profile.photo + ');');
        $('#marker div.avatar img').attr('src', 'http://www.tweedekamer.nl/images/' + window.Kamerleed.person.profile.party.slug + '.jpg');
        //$('#marker p.sentence').text(window.Kamerleed.details.sentence);
        $('#marker').fadeIn();        
    });
};

window.Kamerleed.update = function() {
    $.get('/persons/random/json', function (data) {
        var slug = data['slug'];
        console.log('Should fetch data for ' + slug + ' now ...');
        window.Kamerleed.load_person(slug);
    }, 'json');
};

window.Kamerleed.looper = function() {
    if (window.Kamerleed.loopingEnabled) {
        setTimeout(function() {
            window.Kamerleed.update();
        }, window.Kamerleed.interval);
    }
};

$(document).ready(function() {
    console.log('kamerleed');
    window.Kamerleed.init();

    setTimeout(function() {
        window.Kamerleed.looper();
    }, window.Kamerleed.interval);
});