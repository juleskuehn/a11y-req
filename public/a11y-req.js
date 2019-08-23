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

  if ($('#wizard').length > 0) {
    setupWizardHandler();
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
    selectNone();
    e.preventDefault();
  });
  $('#expandAll').click(function (e) {
    $('li.parentNode').attr('aria-expanded', true);
    $('li.endNode').each(function () {
      toggleClauseText($(this), true);
    });
    e.preventDefault();
  });
  $('#expandTree').click(function (e) {
    $('li.parentNode').attr('aria-expanded', true);
    e.preventDefault();
  });
  $('#collapseAll').click(function (e) {
    $('li.parentNode').attr('aria-expanded', false);
    $('li.endNode').each(function () {
      toggleClauseText($(this), false);
    });
    e.preventDefault();
  });
};

var selectNone = function() {
  $('#clauses input').prop('checked', false).prop('indeterminate', false);
  $('[role="treeitem"]').attr('aria-checked', false);
};

/* CKEditor */

var initCK = function (element) {
  ClassicEditor
    .create(element, {
      language: 'en',
      removePlugins: [],
      // plugins: [ 'Base64UploadAdapter' ],
      toolbar: ['heading', 'bold', 'italic', 'bulletedList', 'numberedList', 'link', 'undo', 'redo', 'imageUpload', 'imageTextAlternative', 'insertTable']
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

/* Wizard questions */

var setupWizardHandler = function () {
  // #preset is the <select> element (see /views/select_fps.pug)
  $('#wizard input').change(function () { updateWizard(); });
};

var allChecked = function(ids) {
  for (id of ids) {
    if (!$('#'+id).is(':checked')) {
      return false;
    }
  }
  return true;
}

var selectClauses = function(clauses) {
  $clauses = $('#clauses')
  for (clauseNum of clauses) {
    // Find the id of the clause checkbox
    $clause = $clauses.find('input[data-number=' + clauseNum + ']')
    if (!$clause.is(':checked')) {
      $clause.click();
    }
  }
}

// Rules for selecting clauses based on answers to wizard questions
var wizardMappings = [
  {
    questions: ['hardware'],
    clauses: ['5', '8']
  }
];

var updateWizard = function() {
  selectNone();
  for (mapping of wizardMappings) {
    if (allChecked(mapping.questions)) {
      selectClauses(mapping.clauses);
    }
  }
};