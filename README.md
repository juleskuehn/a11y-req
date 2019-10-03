# a11y-req
Accessibility Requirements Generator for Information Communication Technology (ICT) Procurement. Based on EN 301 549 (2018)

## Motivation
The EU [Accessible ICT Procurement Toolkit](http://mandate376.standards.eu/procurement-stages/writing-a-call-for-tenders/wizard/technical-requirements/) contains a tool which generates a custom set of accessibility requirements - a subset of the Functional Accessibility Requirements clauses from the EN 301 549 (2014). These clauses are included in a downloadable HTML document for inclusion in procurements.

Unfortunately, this tool was never updated to the 2018 standard. The motivation for a11y-req was to recreate this system, but with a Content Management System (CMS) to allow the clauses and informative sections to be updated as the EN 301 549 refreshes. At the same time, we wished to generate documents in both French and English.

## Functional design decisions
Initially, we followed the same principle of having commonly procured ICT as presets. (Each preset has a certain subset of the requirements relevant to that type of ICT.) In the process of piloting actual procurements, we found that the technical requirements in each Statement of Work (SoW) differed enough that a custom set of accessibility requirements should be chosen for each procurement.

But in contrast to the overly simple "preset" solution, selecting each requirement manually is time consuming and requires strong knowledge of the EN 301 549 standard. A "wizard" style was chosen as a middle-ground between presets and the manual selection, inspired by the [GSA Accessibility Requirements Tool](https://www.buyaccessible.gov/).

The wizard follows three steps:
1. The technical authority responsible for the SoW answers questions about the ICT functionality. Answering these questions require minimal knowledge of accessibility. Relevant clauses will be automatically selected based on a mapping between the questions and the clauses.
2. Optionally, requirements can be fine-tuned by manually selecting clauses from a checkbox-tree. Each testable clause is an end node (leaf) in the tree.
3. Documents are generated from the requirements and can be downloaded in several formats, in both French and English.

All generated documents include a statement which identifies precisely which clauses are included. This statement can be copy / pasted into this tool at step 2 in order to resume fine-tuning of a previous clause selection.

## Known issues
This application should be considered a prototype. While the documents generated are free from textual errors and can be used in actual procurement activities, there are a number of unresolved issues:

### Generated documents
- Image captions are not displayed correctly in the Word documents
    - As a workaround, each image is placed in a two-cell table with the caption as the header cell
- Table captions cannot be set
    - As a workaround, the caption is placed just above the table in bold text
- French Word documents have language tagging issues:
    - The table of requirements is tagged as English in Word. (This issue is not reflected in the code of the document.)
    - English sections - such as references to English documents - are tagged as French.
- Page breaks cannot be set (eg. for putting an Appendix on a new page), nor can "keep together" properties. (The concept of paper pages does not exist in HTML.)
- Styling of Word document is less than ideal

### Web applicaton
- Language of French content within rich text editors is tagged as English (despite setting CKEditor 5 content language to French).
- Alphabetical list styles are not visible in the rich text editor, though present in the HTML of the clauses (which was generated outside of CKEditor).
- CKEditor 5 is incompatible with Internet Explorer 11. Content remains editable as raw HTML in IE11.
- CKEditor 5 has keyboard accessibility issues when working with tables and images.

### Resolving issues
The above issues are primarily due to the requirement of generating Word documents and the limitations of the html-docx-js and CKEditor 5 libraries. Returning to using HTML as the output format would resolve some of these issues. Alternately, modifying the html-docx-js library could improve the generation of Word documents. Other issues can be resolved by switching to CKEditor 4 and using the Language and List-styles plugins. (An inelegant workaround is simply editing the HTML manually in IE11, bypassing rich text editor issues.) Styling issues in the Word document can be resolved by modifying `download.css` (see "Editing the code" below) or simply by editing the generated Word documents.

## Setup
- Install node.js, npm, and MongoDB
- Clone this repository: `git clone https://github.com/juleskuehn/a11y-req`
- In the created directory, run `npm install`

## Usage
- Run `mongod` to start the database server
- Run `mongorestore dump` to populate the database
- Run `npm run devstart` to start the node.js server
- Visit [localhost:3000](http://localhost:3000)

## Understanding the code
This is a CRUD application using Node, Express, MongoDB backend and Web Experience Toolkit frontend. The barebones implementation has its own repo: [wet-mongoose](https://github.com/juleskuehn/wet-mongoose).

The code is based on:
- [Mozilla's Express Tutorial](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/)
- [WAI-ARIA Treeview Example](https://www.w3.org/TR/wai-aria-practices/examples/treeview/treeview-1/treeview-1a.html)

It also depends on the following libraries:
- [GCWeb Theme for WET](https://wet-boew.github.io/themes-dist/GCWeb/gcweb-theme/release/v5.0-en.html) (Government of Canada design system based on Bootstrap)
- [html-docx-js](https://github.com/evidenceprime/html-docx-js) (for generating Word documents)
- [CKEditor 5](https://ckeditor.com/ckeditor-5/) (rich text editor)

Images are stored in the database inline (base64 encoded).

## Editing the code
The files most likely to require modification are:

**`/views/includes/wizard_form.pug`**

Wizard questions, of form `+checkbox('User-facing physical (hardware) components', 'hardware')`. The first parameter to `checkbox()` is the question itself, and the second is the ID which needs to be used in `mappings.js`.

**`/public/mappings.js`**

Maps wizard questions to clauses

**`/views/includes/download_chooser.pug`**

Links to generated document (which are in fact buttons with `formaction` attribute pointing to the appropriate download view)

**`/views/download_*`**

Generated document views. Add views following these examples, and link to them in `/views/includes/download_chooser.pug`. You may have to add or edit includes.

**`/views/download.css`**

CSS for Word documents. Unfortunately, editing this is a matter of trial and error as styling support is inconsistent through html-docx-js library.

**`/controllers/generatorController.js`**

Options for generating documents, common to all `download_*` views.

## Support
[jules.kuehn@canada.ca](mailto:jules.kuehn@canada.ca)
