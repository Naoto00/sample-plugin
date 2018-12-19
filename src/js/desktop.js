jQuery.noConflict();

(function($, PLUGIN_ID) {
    'use strict';

    // Get plug-in configuration settings
    var CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);
    if (!CONFIG) {
        return false;
    }

    var events = [
        'app.record.create.show',
        'app.record.edit.show'
    ];

    kintone.events.on(events, function(e) {
        var spaceElement = kintone.app.record.getSpaceElement(CONFIG.buttonSpace);
        var exchangedVal = CONFIG.beforeExchange;
        var currenbutton = $('<button class="kintoneplugin-button-normal">Show Exchage</button>');
        $(spaceElement).append(currenbutton);

        currenbutton.click(function() {
            var record = kintone.app.record.get();

            // validate date field
            if (!record.record[CONFIG.date].value || moment().isBefore(record.record[CONFIG.date].value)) {
                record.record[CONFIG.date].error = 'The date value is invalid';
                kintone.app.record.set(record);
                return;
            }

            var requestURL = 'http://www.apilayer.net/api/historical';
            requestURL += '?date=' + record.record[CONFIG.date].value;
            kintone.plugin.app.proxy(PLUGIN_ID, requestURL, 'GET', {}, {}).then(function(resp) {
                var rate = record.record[exchangedVal].value * JSON.parse(resp[0]).quotes['USD' + CONFIG.currencies];
                record.record[CONFIG.date].error = null;
                record.record[CONFIG.afterExchange].value = rate;
                kintone.app.record.set(record);
            }).catch(function(err) {
                console.log(err);
                alert('error');
            });

        });

    });

})(jQuery, kintone.$PLUGIN_ID);
