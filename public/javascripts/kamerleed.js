var Kamerleed = window.Kamerleed || {
    app: {
        title: 'Kamerleed'
    },
    interval: 5000,
    loopingEnabled: false,
};

Kamerleed.tidbits = [
    {
        title: 'seniority',
        enabled: function() { return (Kamerleed.person.profile.start_date != null); },
        sentence: function() {
            var d = Date.parse(Kamerleed.person.profile.start_date);
            var s = Math.floor((Date.now() - d) / 86400000) - 1;
            return sprintf("%s zit al %s dagen in de tweede kamer!", Kamerleed.person.profile.name, s);
        }
    },
    // FIXME: better to parse age for this?
    {
        title: 'age',
        enabled: function() { return (Kamerleed.person.profile.age != null); },
        sentence: function() {
            return sprintf(
                "Wist je dat %s alweer %s jaar oud is?",
                Kamerleed.person.profile.name,
                Kamerleed.person.profile.age
            )
        }
    },
    {
        title: 'birthplace',
        enabled: function() { return (Kamerleed.person.profile.birth_place != null); },
        sentence: function() {
            return sprintf(
                "Blijkbaar is %s geboren in %s!",
                Kamerleed.person.profile.name,
                Kamerleed.person.profile.birth_place
            );
        }
    },
    {
        title: 'hometown',
        enabled: function() { return (Kamerleed.person.profile.home_town != null); },
        sentence: function() {
            return sprintf(
                "Blijkbaar woont %s in %s!",
                Kamerleed.person.profile.name,
                Kamerleed.person.profile.home_town
            );
        }
    },
];

Kamerleed.init = function() {
    // detemine what to load
    if (window.location.pathname == '/') {
        // get random member
        console.log('homepage, should get a random member now ...');
        Kamerleed.update();
    } else if (person_match = window.location.pathname.match(/^\/persons\/([a-zA-z\-]+)\/?/)) {
        var slug = person_match[1];
        console.log('Politician page, should fetch data for ' + slug + ' now ...');
        Kamerleed.load_person(slug);
    } else {
        console.log('At a totally random path ...');
    }
};

Kamerleed.load_person = function(slug) {
    $.get('/persons/' + slug + '/json', function (data) {
        Kamerleed.person = data;
        Kamerleed.refresh_full_interface();
        // loop the interface
        Kamerleed.looper();
    });
};

Kamerleed.select_tidbit = function() {
    var enabled_tidbits = $.grep(Kamerleed.tidbits, function(item, idx) {
        return item.enabled();
    });
    var random_index = Math.floor((Math.random()*enabled_tidbits.length));
    return enabled_tidbits[random_index];
};

Kamerleed.refresh_full_interface = function() {
    // do interface refresh here
    document.title = sprintf("%s - %s", Kamerleed.app.title, Kamerleed.person.profile.name);
    Kamerleed.refresh_marker();
    Kamerleed.create_twitter_widget();
    Kamerleed.create_politwoops_widget();
    console.log('Interface refreshed!'); 
};

Kamerleed.create_twitter_widget = function() {
    if (Kamerleed.person.profile.twitter.accounts.length > 0) {
        var username = Kamerleed.person.profile.twitter.accounts[0];
        console.log('creating twitter qidget for ' + username);
        $('#twitter-widget-marker').html('<a style="display: none;" class="twitter-timeline" href="https://twitter.com/' + username + '" width="300" data-widget-id="366942720322838528" data-screen-name="' + username + '">Tweets by @' + username + '</a>');
        twttr.widgets.load();
    } else {
        $('#twitter-widget-marker').empty();
    }
};

Kamerleed.create_politwoops_widget = function() {
    if (Kamerleed.person.profile.twitter.accounts.length > 0) {
        var username = Kamerleed.person.profile.twitter.accounts[0];
        $.get(sprintf('http://www.politwoops.com/user/%s.js?callback=?', username), function (data) {
            console.log('Got politwoops data!');
            console.dir(data);
        }, 'jsonp');
    } else {
        $('#politwoops-widget-marker').empty();
    }
    
};

Kamerleed.refresh_marker = function() {
    $('#marker').fadeOut(500, function() {
        var tidbit = Kamerleed.select_tidbit();
        $('#marker').removeClass('block1 block2 block3 block4 block5 block6 block7 blockundefined').addClass('block' + Kamerleed.person.profile.block);
        $('#marker div.avatar').attr('style', 'background: url(' + Kamerleed.person.profile.photo + ');');
        $('#marker div.avatar img').attr('src', 'http://www.tweedekamer.nl/images/' + Kamerleed.person.profile.party.slug + '.jpg');
        $('#marker p.sentence').text(tidbit.sentence());
        $('#marker').fadeIn();        
    });
};

Kamerleed.update = function() {
    $.get('/persons/random/json', function (data) {
        var slug = data['slug'];
        console.log('Should fetch data for ' + slug + ' now ...');
        Kamerleed.load_person(slug);
    }, 'json');
};

Kamerleed.looper = function() {
    if (Kamerleed.loopingEnabled) {
        setTimeout(function() {
            Kamerleed.update();
        }, Kamerleed.interval);
    }
};

$(document).ready(function() {
    console.log('kamerleed');
    Kamerleed.init();

    setTimeout(function() {
        Kamerleed.looper();
    }, Kamerleed.interval);
});