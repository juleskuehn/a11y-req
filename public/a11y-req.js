// Client side scripts for a11y-req
// NOT FOR WET OVERRIDES

$(document).ready(() => {

  // #preset-data is a hidden element on requirement selection page
  if ($('#preset-data').length > 0) {
    setupPresetHandler();
  }

  if ($('#clauses').length > 0) {
    setupTreeHandler();
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
  $('#selectAll').click((e) => {
    $('#clauses input').prop('checked', true);
    e.preventDefault();
  });
  $('#selectNone').click((e) => {
    $('#clauses input').prop('checked', false)
    e.preventDefault();
  });
};

const updatePresetSelections = () => {
  let preset = $('#preset').val();
  // Save existing selections

  // Uncheck all checkboxes
  $('#clauses input').prop('checked', false);
  // Get hidden preset data (see /views/select_fps.pug)
  $('#' + preset + ' li').each(function () {
    // Check the preset checkboxes
    $('#' + this.innerHTML).prop('checked', true);
  });
};


/* Tree menu selection */

const setupTreeHandler = () => {

  // 1. Explicit selection of a parent clause cascades down sub-clauses
  // 2. Any selection of a sub-clause forces selection of parent clause
  // 3. Informative clauses must be checked whenever parent is checked
  $('.checkbox input:checkbox').change(function() {
    let $el = $(this);
    console.log($el);
    
    
    // Handle case 1: Cascade selection change down sub-clauses
    if ($el.closest('summary').length > 0) {
      $el.closest('details')
          .find('.checkbox input:checkbox')
          .prop('checked', $el.prop('checked'));
    }

    // Handle cases 2 and 3
    bubbleUpClause($el);
  });
  
  let bubbleUpClause = ($el) => {

    let parent = $el.closest('details');
    // If this sub-clause has children, the target needs adjustment
    if ($el.closest('div.leafNode').length === 0 ) {
      parent = parent.parent();
    }

    // Parents must be checked if any child is checked
    let value = parent.find('input:checkbox:not(:first)').is(':checked');
    parent.find('summary .checkbox input:checkbox')
        .first().prop('checked', value);

    parent.children('div.leafNode').find('input:checkbox.informative').prop('checked', value);

  }    

};

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
};

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