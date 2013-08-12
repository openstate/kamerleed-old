window.Kamerleed = window.Kamerleed || {
    app: {
        title: 'Kamerleed'
    },
};
window.Kamerleed.interval = 5000;
window.Kamerleed.loopingEnabled = false;

window.Kamerleed.tidbits = [
    {
        title: 'seniority',
        enabled: function() { return (window.Kamerleed.person.profile.start_date != null); },
        sentence: function() {
            var d = Date.parse(window.Kamerleed.person.profile.start_date);
            var s = Math.floor((Date.now() - d) / 86400000) - 1;
            return sprintf("%s zit al %s dagen in de tweede kamer!", window.Kamerleed.person.profile.name, s);
        }
    },
    // FIXME: better to parse age for this?
    {
        title: 'age',
        enabled: function() { return (window.Kamerleed.person.profile.age != null); },
        sentence: function() {
            return sprintf(
                "Wist je dat %s alweer %s jaar oud is?",
                window.Kamerleed.person.profile.name,
                window.Kamerleed.person.profile.age
            )
        }
    },
    {
        title: 'birthplace',
        enabled: function() { return (window.Kamerleed.person.profile.birth_place != null); },
        sentence: function() {
            return sprintf(
                "Blijkbaar is %s geboren in %s!",
                window.Kamerleed.person.profile.name,
                window.Kamerleed.person.profile.birth_place
            );
        }
    },
    {
        title: 'hometown',
        enabled: function() { return (window.Kamerleed.person.profile.home_town != null); },
        sentence: function() {
            return sprintf(
                "Blijkbaar woont %s in %s!",
                window.Kamerleed.person.profile.name,
                window.Kamerleed.person.profile.home_town
            );
        }
    },
];

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

window.Kamerleed.select_tidbit = function() {
    var enabled_tidbits = $.grep(window.Kamerleed.tidbits, function(item, idx) {
        return item.enabled();
    });
    var random_index = Math.floor((Math.random()*enabled_tidbits.length));
    return enabled_tidbits[random_index];
};

window.Kamerleed.refresh_full_interface = function() {
    // do interface refresh here
    document.title = sprintf("%s - %s", window.Kamerleed.app.title, window.Kamerleed.person.profile.name);
    window.Kamerleed.refresh_marker();
    window.Kamerleed.create_twitter_widget();
    console.log('Interface refreshed!'); 
};

window.Kamerleed.create_twitter_widget = function() {
    if (window.Kamerleed.person.profile.twitter.accounts.length > 0) {
        var username = window.Kamerleed.person.profile.twitter.accounts[0];
        console.log('creating twitter qidget for ' + username);
        $('#twitter-widget-marker').html('<a class="twitter-timeline" href="https://twitter.com/' + username + '" width="300" data-widget-id="366942720322838528" data-screen-name="' + username + '">Tweets by @' + username + '</a>');
        twttr.widgets.load();
    } else {
        $('#twitter-widget-marker').empty();
    }
};

window.Kamerleed.refresh_marker = function() {
    $('#marker').fadeOut(500, function() {
        var tidbit = window.Kamerleed.select_tidbit();
        $('#marker').removeClass('block1 block2 block3 block4 block5 block6 block7 blockundefined').addClass('block' + window.Kamerleed.person.profile.block);
        $('#marker div.avatar').attr('style', 'background: url(' + window.Kamerleed.person.profile.photo + ');');
        $('#marker div.avatar img').attr('src', 'http://www.tweedekamer.nl/images/' + window.Kamerleed.person.profile.party.slug + '.jpg');
        $('#marker p.sentence').text(tidbit.sentence());
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