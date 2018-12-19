jQuery.noConflict();

(function($, PLUGIN_ID) {
    'use strict';
    var $accessKey = $('#accessKey');
    var $spaceDropDown = $('#select_button_space');
    var $bfrDropDown = $('#select_before_exchange');
    var $aftDropDown = $('#select_after_exchange');
    var $dateDropDown = $('#date');
    var config = kintone.plugin.app.getConfig(PLUGIN_ID);

    var requestURL = 'http://www.apilayer.net/api/historical';

    function getSettingsUrl() {
        return '/k/admin/app/flow?app=' + kintone.app.getId();
    }

    function getFields() {
        return kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'GET',
            {'app': kintone.app.getId()}).then(function(resp) {
            return resp.properties;
        });
    }

    function setDropDownForSpace(rows, field) {
        // Get information of each field
        for (var i = 0; i < rows.length; i++) {
            var fields = rows[i];
            for (var cnt = 0; cnt < fields.length; cnt++) {
                var rowField = fields[cnt];
                switch (rowField.type) {
                    // Only select Space fields
                    case 'SPACER':
                        var $op = $('<option value="' + rowField.elementId + '">' + rowField.elementId + '</option>');
                        $spaceDropDown.append($op);
                        break;
                    case 'NUMBER':
                        if (field[rowField.code]) {
                            var $opText = $('<option value="' +
                                field[rowField.code].code + '">' + field[rowField.code].label + '</option>');
                            $bfrDropDown.append($opText);
                            $aftDropDown.append($opText.clone());
                        }
                        break;
                    case 'DATE':
                        if (field[rowField.code]) {
                            var $opDate = $('<option value="' +
                                field[rowField.code].code + '">' + field[rowField.code].label + '</option>');
                            $dateDropDown.append($opDate);
                        }
                        break;
                    default:
                        break;
                }
            }
        }
        // Set default values
        if (config.buttonSpace) {
            $spaceDropDown.val(config.buttonSpace);
        }
        if (config.beforeExchange) {
            $bfrDropDown.val(config.beforeExchange);
        }
        if (config.afterExchange) {
            $aftDropDown.val(config.afterExchange);
        }
        if (config.date) {
            $dateDropDown.val(config.date);
        }
    }

    function getLayout() {
        // Retrieve field information, then set drop-down
        return kintone.api(kintone.api.url('/k/v1/preview/app/form/layout', true), 'GET',
            {'app': kintone.app.getId()}).then(function(resp) {
            var rows = [];
            for (var i = 0; i < resp.layout.length; i++) {
                var row = resp.layout[i];
                // If type is ROW
                if (row.type === 'ROW') {
                    rows.push(row.fields);
                } else if (row.type === 'GROUP') {
                    for (var j = 0; j < row.layout.length; j++) {
                        var row2 = row.layout[j];
                        if (row2.type !== 'ROW') {
                            continue;
                        }
                        rows.push(row2.fields);
                    }
                }
            }
            return rows;
        }, function(resp) {
            return alert('Failed to retrieve layout information.');
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
        var promises = [getLayout(), getFields()];
        kintone.Promise.all(promises).then(function(resp) {
            setDropDownForSpace(resp[0], resp[1]);
        });
        // Set input values when 'Save' button is clicked
        $('#check-plugin-submit').click(function() {
            var $targetCurrency = $('[name=radio]:checked');
            var body = {
                'access_key': $accessKey.val(),
                'currencies': $targetCurrency.val()
            };
            kintone.plugin.app.setProxyConfig(requestURL, 'GET', {}, body, function() {
                kintone.plugin.app.setConfig({
                    'access_key': $accessKey.val(),
                    'buttonSpace': $spaceDropDown.val(),
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
