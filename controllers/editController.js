const strings = {
  editListTitle: 'Edit content'
}

// Display list of all Clauses
exports.edit_list = (req, res, next) => {
  res.render('edit', { title: strings.editListTitle });
};