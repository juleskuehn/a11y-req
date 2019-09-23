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
      toggleClauseText($(this), true, true);
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

  // Focus highlighting
  $('#wizard input').focus(function () { $(this).closest('.checkbox').addClass('focus'); });
  $('#wizard input').blur(function () { $(this).closest('.checkbox').removeClass('focus'); });
};

var allChecked = function(ids) {
  for (var i = 0; i < ids.length; i++) {
    id = ids[i];
    if (!$('#'+id).is(':checked')) {
      return false;
    }
  }
  return true;
}

var noneChecked = function(ids) {
  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    if ($('#'+id).is(':checked')) {
      return false;
    }
  }
  return true;
}

var selectClauses = function(clauses, select) {
  $clauses = $('#clauses')
  for (var i = 0; i < clauses.length; i++) {
    var clauseNum = clauses[i];
    // Find the id of the clause checkbox
    $clause = $clauses.find('input[data-number="' + clauseNum + '"]')
    if (select) {
      if (!$clause.is(':checked')) {
        $clause.click();
      }
    } else {
      if ($clause.is(':checked')) {
        $clause.click();
      }
    }
  }
}

// Rules for selecting clauses based on answers to wizard questions
var positiveMappings = [
  {
    questions: ['hardware'],
    clauses: ['5.5','5.6','5.7','5.8','5.9','8.1','8.4']
  },
  {
    questions: ['shared'],
    clauses: ['8.5']
  },
  {
    questions: ['speech-output'],
    clauses: ['8.2.1']
  },
  {
    questions: ['web'],
    clauses: ['9']
  },
  {
    questions: ['non-web-docs'],
    clauses: ['10']
  },
  {
    questions: ['documentation'],
    clauses: ['12.1.2']
  },
  {
    questions: ['support'],
    clauses: ['12.2']
  },
  {
    questions: ['voice-comm'],
    clauses: ['6']
  },
  {
    questions: ['comm'],
    clauses: ['13.2','13.3']
  },
  {
    questions: ['video-sync'],
    clauses: ['7.1','7.2']
  },
  {
    questions: ['video-player'],
    clauses: ['7.3']
  },
  {
    questions: ['relay'],
    clauses: ['13.1']
  },
  {
    questions: ['ui'],
    clauses: ['11.1','11.2','11.3','11.4','11.5','11.6.2','11.7']
  },
  {
    questions: ['platform'],
    clauses: ['11.5.2.1','11.5.2.2']
  },
  {
    questions: ['a11y'],
    clauses: ['5.2']
  },
  {
    questions: ['a11y','documentation'],
    clauses: ['12.1.1']
  },
  {
    questions: ['at'],
    clauses: ['11.5.2.4']
  },
  {
    questions: ['authoring'],
    clauses: ['11.8']
  },
  {
    questions: ['a11y','platform'],
    clauses: ['11.6.1']
  },
  {
    questions: ['integrated'],
    clauses: ['8.3']
  },
  {
    questions: ['t-coil'],
    clauses: ['8.2.2.1']
  },
  {
    questions: ['mobile-phone'],
    clauses: ['8.2.2.2']
  },
  {
    questions: ['closed'],
    clauses: ['5.1']
  },
  {
    questions: ['bio'],
    clauses: ['5.3']
  },
  {
    questions: ['conversion'],
    clauses: ['5.4']
  }
];

var negativeMappings = [
  {
    questions: ['video-comm'],
    clauses: ['6.5','6.6']
  },
  {
    questions: ['keys'],
    clauses: ['8.4.3']
  },
  {
    questions: ['closed'],
    clauses: ['11.5.1','11.1.1.1.2','11.1.2.1.2','11.1.2.3.2','11.1.3.1.2','11.1.3.2.2','11.1.4.4.2','11.1.4.5.2','11.1.4.10.2','11.2.1.1.2','11.2.1.4.2','11.3.1.1.2','11.3.3.1.2','11.4.1.1.2','11.4.1.2.2']
  },
  {
    questions: ['platform'],
    clauses: ['11.5.2.1','11.5.2.2']
  },
  {
    questions: ['at'],
    clauses: ['11.5.2.4']
  },
];

var updateWizard = function() {
  selectNone();
  for (var i = 0; i < positiveMappings.length; i++) {
    var mapping = positiveMappings[i];
    if (allChecked(mapping.questions)) {
      selectClauses(mapping.clauses, true);
    }
  }
  for (var i = 0; i < positiveMappings.length; i++) {
    var mapping = positiveMappings[i];
    if (noneChecked(mapping.questions)) {
      selectClauses(mapping.clauses, false);
    }
  }
};
