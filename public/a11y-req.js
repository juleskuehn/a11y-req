// Client side scripts for a11y-req
// NOT FOR WET OVERRIDES

$(document).ready(() => {

  // #preset-data is a hidden element on requirement selection page
  if ($('#preset-data').length > 0) {
    setupPresetHandler();
  }

  if ($('#clauses').length > 0) {
    // setupTreeHandler();
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
  $('[role="treeitem"]').each(function () {
    updateAriaChecked($(this));
  });
};


/* Tree menu selection */

const setupTreeHandler = () => {

  // 1. Explicit selection of a clause cascades down sub-clauses
  // 2. Parent is checked if and only if a (non-informative) child is checked
  // 3. Informative clause is checked if and only if parent is checked
  $('.checkbox input:checkbox').change(function () {
    let $el = $(this);

    // Handle case 1: Cascade selection change down sub-clauses
    if ($el.closest('summary').length > 0) {
      $el.closest('details')
        .find('.checkbox input:checkbox')
        .prop('checked', $el.is(':checked'));
    }

    // Handle cases 2 and 3
    bubbleUpClause($el);
  });

  let bubbleUpClause = ($el) => {

    // Get parent clause, if there is one
    let parent = $el.closest('details');
    // If this sub-clause has children, the target needs adjustment
    if ($el.closest('div.leafNode').length === 0) {
      parent = parent.parent();
      // Reached the top of the clause tree. Nothing to do.
      if (!parent.is('details')) {
        return;
      }
    }

    // Handle case 2
    let value = parent.find('input:checkbox:not(:first):not(.informative)').is(':checked');
    parent.find('summary .checkbox input:checkbox')
      .first().prop('checked', value);

    // Handle case 3
    parent.children('div.leafNode').find('input:checkbox.informative').prop('checked', value);

    // Recurse up the tree
    bubbleUpClause(parent);
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

MinHeightPlugin.prototype.init = function () {
  this.editor.ui.view.editable.extendTemplate({
    attributes: {
      style: {
        maxHeight: '400px'
      }
    }
  });
};

ClassicEditor.builtinPlugins.push(MinHeightPlugin);