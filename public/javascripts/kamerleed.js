window.Kamerleed = window.Kamerleed || {};

window.Kamerleed.update = function() {
    $.get('/json/details', function (data) {
        window.Kamerleed.details = data;
    });
};

$(document).ready(function() {
    console.log('kamerleed');
});