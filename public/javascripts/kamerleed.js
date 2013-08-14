var Kamerleed = window.Kamerleed || {
    app: {
        title: 'Kamerleed'
    },
    interval: 30,
    counter: 0,
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

Kamerleed.time_lapsed = function() {
    console.log('time lapsed !');
    if (Kamerleed.loopingEnabled) {
        Kamerleed.counter += 1;
    }

    if (Kamerleed.counter > Kamerleed.interval) {
        Kamerleed.counter = 0;
        Kamerleed.loopingEnabled = false;
        
        Kamerleed.update();
    }

    var pct = Math.floor(Kamerleed.counter * 100 / Kamerleed.interval);
    $('.meter span').attr('style', sprintf('width: %s%%;', pct));
};

Kamerleed.init = function() {
    moment.lang('nl');
    
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
    
    $('#control-playpause').click(function() {
        Kamerleed.loopingEnabled = !Kamerleed.loopingEnabled;
        if (Kamerleed.loopingEnabled) {
            $('#control-playpause').removeClass('play').addClass('pause');
        } else {
            $('#control-playpause').removeClass('pause').addClass('play');            
        }
    });
    
    $('#control-ffwd').click(function() {
        console.log('next pressed!');
        Kamerleed.counter = 0;
        Kamerleed.update();
    });

    setInterval(function() {
        Kamerleed.time_lapsed();
    }, 1000);
};

Kamerleed.load_person = function(slug) {
    $.get('/persons/' + slug + '/json', function (data) {
        Kamerleed.person = data;
        Kamerleed.refresh_full_interface();
        // loop the interface
        //Kamerleed.looper();
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
    Kamerleed.loopingEnabled = true;
    console.log('Interface refreshed!'); 
};

Kamerleed.create_twitter_widget = function() {
    if (Kamerleed.person.profile.twitter.accounts.length > 0) {
        var username = Kamerleed.person.profile.twitter.accounts[0];
        console.log('creating twitter qidget for ' + username);
        $('#twitter-widget-marker').html('<a style="display: none;" class="twitter-timeline" href="https://twitter.com/' + username + '" width="300" data-widget-id="366942720322838528" data-screen-name="' + username + '">Tweets by @' + username + '</a>');
        twttr.widgets.load();
        $('#twitter-widget-marker').fadeIn();
    } else {
        $('#twitter-widget-marker').fadeOut();
    }
};

Kamerleed.create_politwoops_widget = function() {
    if (Kamerleed.person.profile.twitter.accounts.length > 0) {
        $('#politwoops-widget-marker').height($('body').parent().height() - 32);
        $('#politwoops-list').empty();
        var username = Kamerleed.person.profile.twitter.accounts[0];
        $.get(sprintf('http://www.politwoops.com/user/%s.js?callback=?', username), function (data) {
            console.log('Got politwoops data!');
            console.dir(data);
            $.each(data, function(idx, tweet) {
                var deleted_at = moment(tweet.updated_at);
                var created_at = moment(tweet.created_at);
                $('#politwoops-list').append($(tmpl('twoops', tweet)));
                $('#twoops-' + tweet.id + ' .deleted').text(moment(tweet.details.deleted_at).fromNow() + ' verwijderd');
                $('#twoops-' + tweet.id + ' .after').text(deleted_at.from(created_at).replace('over', 'na'));
            });
            $('#politwoops-widget-marker').fadeIn();
        }, 'jsonp');
    }
};

Kamerleed.refresh_marker = function() {
    var tidbit = Kamerleed.select_tidbit();
    $('#marker').removeClass('block1 block2 block3 block4 block5 block6 block7 blockundefined').addClass('block' + Kamerleed.person.profile.block);
    $('#marker div.avatar').attr('style', 'background: url(' + Kamerleed.person.profile.photo + ');');
    $('#marker div.avatar img').attr('src', 'http://www.tweedekamer.nl/images/' + Kamerleed.person.profile.party.slug + '.jpg');
    $('#marker p.sentence').text(tidbit.sentence());
    $('#marker').fadeIn();        
};

Kamerleed.update = function() {
    $('#twitter-widget-marker').fadeOut(500);
    $('#politwoops-widget-marker').fadeOut(500);
    $('#marker').fadeOut(500);
    $.get('/persons/random/json', function (data) {
        var slug = data['slug'];
        console.log('Should fetch data for ' + slug + ' now ...');
        Kamerleed.load_person(slug);
    }, 'json');
};

$(document).ready(function() {
    console.log('kamerleed');
    Kamerleed.init();
});