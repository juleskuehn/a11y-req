// Client side scripts for a11y-req
// NOT FOR WET OVERRIDES

$(document).ready(() => {

  // #preset-data is a hidden element on requirement selection page
  if ($('#preset-data').length > 0) {
    setupPresetHandler();
  }

  // Replace <textarea> with rich text editor (CKEditor)
  $('textarea').each(function () {
    initCK(this);
  });
});


/* Generator preset handling */

const setupPresetHandler = () => {
  // #preset is the <select> element (see /views/select_fps.pug)
  $('#preset').change(() => updatePresetSelections());
}

const updatePresetSelections = () => {
  let preset = $('#preset').val();
  // Uncheck all checkboxes
  $('#clauses input').prop('checked', false);
  if (preset === '') return;
  // Get hidden preset data (see /views/select_fps.pug)
  $('#' + preset + ' li').each(function () {
    // Check the preset checkboxes
    $('#' + this.innerHTML).prop('checked', true);
  });
}


/* CKEditor */

const initCK = (element) => {
  ClassicEditor
    .create(element, {
      language: 'en',
      removePlugins: [],
      toolbar: ['heading', 'bold', 'italic', 'bulletedList', 'numberedList', 'link', 'undo', 'redo']
    })
    .then(editor => {
      console.log(editor);
      console.log(Array.from(editor.ui.componentFactory.names()));
    })
    .catch(error => console.error(error));
};

console.log(ClassicEditor.builtinPlugins.map(plugin => plugin.pluginName));

// https://stackoverflow.com/questions/46559354/how-to-set-the-height-of-ckeditor-5-classic-editor/56550285#56550285
function MinHeightPlugin(editor) {
  this.editor = editor;
}

MinHeightPlugin.prototype.init = function() {
  this.editor.ui.view.editable.extendTemplate({
    attributes: {
      style: {
        maxHeight: '400px'
      }
    }
  });
};

ClassicEditor.builtinPlugins.push(MinHeightPlugin);