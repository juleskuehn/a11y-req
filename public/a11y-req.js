// Client side scripts for a11y-req
// NOT FOR WET OVERRIDES

$(document).ready(function () {

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

var setupPresetHandler = function () {
  // #preset is the <select> element (see /views/select_fps.pug)
  $('#preset').change(function () { updatePresetSelections(); });
};

var updatePresetSelections = function () {
  var preset = $('#preset').val();
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

var setupTreeHandler = function () {
  $('#selectAll').click(function (e) {
    $('#clauses input').prop('checked', true).prop('indeterminate', false);
    $('[role="treeitem"]').attr('aria-checked', true);
    e.preventDefault();
  });
  $('#selectNone').click(function (e) {
    $('#clauses input').prop('checked', false).prop('indeterminate', false);
    $('[role="treeitem"]').attr('aria-checked', false);
    e.preventDefault();
  });
  $('#expandAll').click(function (e) {
    $('li.parentNode').attr('aria-expanded', true);
    e.preventDefault();
  });
  $('#collapseAll').click(function (e) {
    $('li.parentNode').attr('aria-expanded', false);
    e.preventDefault();
  });
};

/* CKEditor */

var initCK = function (element) {
  ClassicEditor
    .create(element, {
      language: 'en',
      removePlugins: [],
      toolbar: ['heading', 'bold', 'italic', 'bulletedList', 'numberedList', 'link', 'undo', 'redo']
    })
    .then(function (editor) {
      console.log(editor);
      console.log(Array.from(editor.ui.componentFactory.names()));
    })
    .catch(function (error) { console.error(error); });
    
    // console.log(ClassicEditor.builtinPlugins.map(plugin => plugin.pluginName));
    
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
};
