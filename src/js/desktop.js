jQuery.noConflict();

(function($, PLUGIN_ID) {
    'use strict';

    // Get plug-in configuration settings
    var CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);
    if (!CONFIG) {
        return false;
    }

    var events = [
        'app.record.create.change.' + CONFIG.beforeExchange,
        'app.record.edit.change.' + CONFIG.beforeExchange,
        'app.record.create.change.' + CONFIG.date,
        'app.record.edit.change.' + CONFIG.date
    ];

    kintone.events.on(events, function(event) {
        var record = event.record;
        var dtVal = record[CONFIG.date].value;
        var bfrExchangeVal = record[CONFIG.beforeExchange].value;
        var dtisFuture = moment(dtVal).isAfter(moment());
        // validate date field and exchanged filed
        if (record[CONFIG.date].error || record[CONFIG.beforeExchange].error || event.error) {
            return event;
        }
        if ((!dtVal || dtisFuture) && !bfrExchangeVal) {
            record[CONFIG.date].error = 'The date value is invalid';
            record[CONFIG.beforeExchange].error = 'The exchanged value is empty';
            return event;
        } else if (!dtVal || dtisFuture) {
            record[CONFIG.date].error = 'The date value is invalid';
            record[CONFIG.beforeExchange].error = null;
            return event;
        } else if (!bfrExchangeVal) {
            record[CONFIG.beforeExchange].error = 'The exchanged value is empty';
            record[CONFIG.date].error = null;
            return event;
        }
        record[CONFIG.beforeExchange].error = null;
        record[CONFIG.date].error = null;

        var requestURL = 'http://www.apilayer.net/api/historical';
        requestURL += '?date=' + dtVal;
        kintone.plugin.app.proxy(PLUGIN_ID, requestURL, 'GET', {}, {}).then(function(resp) {
            if (!JSON.parse(resp[0]).success) {
                return kintone.Promise.reject(new Error(JSON.parse(resp[0]).error.info));
            }
            var rate = bfrExchangeVal * JSON.parse(resp[0]).quotes['USD' + CONFIG.currencies];
            record[CONFIG.afterExchange].value = rate;
            var setRecord = {
                'record': record
            };
            kintone.app.record.set(setRecord);
        }).catch(function(err) {
            console.log(err);
            alert(err);
        });
        return event;

    });

})(jQuery, kintone.$PLUGIN_ID);
