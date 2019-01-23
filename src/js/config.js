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
      var $opText = $('<option></option>');
      var $opDate = $('<option></option>');
      Object.keys(resp.properties).forEach(function(key) {
        if (!resp.properties.hasOwnProperty(key)) {
          return;
        }
        switch (resp.properties[key].type) {
          case 'NUMBER':
            $opText.attr('value', resp.properties[key].code);
            $opText.text(resp.properties[key].label);
            $bfrDropDown.append($opText);
            $aftDropDown.append($opText.clone());
            break;
          case 'DATE':
            $opDate.attr('value', resp.properties[key].code);
            $opDate.text(resp.properties[key].label);
            $dateDropDown.append($opDate);
        }
      });
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
    if (config.accessKey) {
      $accessKey.val(config.accessKey);
    }
    if (config.currencies) {
      $('#' + config.currencies).prop('checked', true);
    }
    // Set drop-down list
    setDropDownForSpace();
    // Set input values when 'Save' button is clicked
    $('#check-plugin-submit').click(function() {
      var $targetCurrency = $('[name=radio]:checked');

      // Check required fields value
      var requiredParams = [
        $accessKey.val(),
        $bfrDropDown.val(),
        $aftDropDown.val(),
        $dateDropDown.val()
      ];
      var body = {
        'access_key': $accessKey.val(),
        'currencies': $targetCurrency.val()
      };
      var paramIsEmpty;
      requiredParams.forEach(function(i) {
        if (!requiredParams[i] || requiredParams[i] === '-----') {
          paramIsEmpty = true;
        }
      });
      if (paramIsEmpty) {
        alert('Please set required field(s)');
        return;
      }
      if ($bfrDropDown.val() === $aftDropDown.val()) {
        alert('USD and Output Currency must be set as different fields');
        return;
      }
      kintone.plugin.app.setProxyConfig(requestURL, 'GET', {}, body, function() {
        kintone.plugin.app.setConfig({
          'accessKey': $accessKey.val(),
          'beforeExchange': $bfrDropDown.val(),
          'currencies': $targetCurrency.val(),
          'afterExchange': $aftDropDown.val(),
          'date': $dateDropDown.val()
        }, function() {
          alert('Please update the app!');
          window.location.href = getSettingsUrl();
        });
      });
    });
    // Process when 'Cancel' is clicked
    $('#check-plugin-cancel').click(function() {
      history.back();
    });
  });

})(jQuery, kintone.$PLUGIN_ID);
