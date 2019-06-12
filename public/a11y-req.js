// Client side scripts for a11y-req
// NOT FOR WET OVERRIDES

$(document).ready(() => {
  // Generator preset handling
  if ($('#preset-data').length > 0) {
    setupPresetHandler();
  }
});


/* Generator preset handling */

const setupPresetHandler = () => {
  $('#preset').change(() => updatePresetSelections());
}

const updatePresetSelections = () => {
  let preset = $('#preset').val();
  $('#clauses input').prop('checked', false);
  if (preset === '') return;
  $('#' + preset + ' li').each(function () {
    $('#' + this.innerHTML).prop('checked', true);
  });
}