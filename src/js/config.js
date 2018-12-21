jQuery.noConflict();

(function($, PLUGIN_ID) {
    'use strict';
    var $accessKey = $('#accessKey');
    var $bfrDropDown = $('#select_before_exchange');
    var $aftDropDown = $('#select_after_exchange');
    var $dateDropDown = $('#date');
    var config = kintone.plugin.app.getConfig(PLUGIN_ID);

    var requestURL = 'http://www.apilayer.net/api/historical';

    function getSettingsUrl() {
        return '/k/admin/app/flow?app=' + kintone.app.getId();
    }

    // Get information of each field
    function setDropDownForSpace() {
        kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'GET',
            {'app': kintone.app.getId()}).then(function(resp) {
            for (var key in resp.properties) {
                if (!resp.properties.hasOwnProperty(key)) {continue;}
                switch (resp.properties[key].type) {
                    case 'NUMBER':
                        var $opText = $('<option value="' +
                        resp.properties[key].code + '">' + resp.properties[key].label + '</option>');
                        $bfrDropDown.append($opText);
                        $aftDropDown.append($opText.clone());
                        break;
                    case 'DATE':
                        var $opDate = $('<option value="' +
                        resp.properties[key].code + '">' + resp.properties[key].label + '</option>');
                        $dateDropDown.append($opDate);
                }
            }
            // Set default values
            if (config.beforeExchange) {
                $bfrDropDown.val(config.beforeExchange);
            }
            if (config.afterExchange) {
                $aftDropDown.val(config.afterExchange);
            }
            if (config.date) {
                $dateDropDown.val(config.date);
            }
        });
    }

    $(document).ready(function() {
        // Set default values
        if (config.access_key) {
            $accessKey.val(config.access_key);
        }
        if (config.currencies) {
            $('#' + config.currencies).prop('checked', true);
        }
        // Set drop-down list
        setDropDownForSpace();
        // Set input values when 'Save' button is clicked
        $('#check-plugin-submit').click(function() {
            var $targetCurrency = $('[name=radio]:checked');

            // Check required fields
            var requiredParams = [
                $accessKey.val(),
                $bfrDropDown.val(),
                $aftDropDown.val(),
                $dateDropDown.val()
            ];
            for (var i in requiredParams) {
                if (!requiredParams[i] || requiredParams[i] === '-----') {
                    alert('Please set required field(s)');
                    return;
                }
            }
            if ($bfrDropDown.val() === $aftDropDown.val()) {
                alert('両替前と両替後のフィールドは違う数値フィールドを選択してください');
                return;
            }

            var body = {
                'access_key': $accessKey.val(),
                'currencies': $targetCurrency.val()
            };
            kintone.plugin.app.setProxyConfig(requestURL, 'GET', {}, body, function() {
                kintone.plugin.app.setConfig({
                    'access_key': $accessKey.val(),
                    'beforeExchange': $bfrDropDown.val(),
                    'currencies': $targetCurrency.val(),
                    'afterExchange': $aftDropDown.val(),
                    'date': $dateDropDown.val()
                });
                alert('Please update the app!');
                window.location.href = getSettingsUrl();
            });
        });
        // Process when 'Cancel' is clicked
        $('#check-plugin-cancel').click(function() {
            history.back();
        });
    });

})(jQuery, kintone.$PLUGIN_ID);
