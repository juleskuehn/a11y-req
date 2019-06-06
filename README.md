# a11y-req
Accessibility Requirements Generator for ICT Procurement. Based on EN 301 549 (2018)

## Understanding the code
This is a CRUD application using Node, Express, MongoDB backend and Web Experience Toolkit frontend. The barebones implementation has its own repo: [wet-mongoose](https://github.com/juleskuehn/wet-mongoose).

The code is based on:
- [Mozilla's Express Tutorial](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/)
- [GCWeb Theme for WET](https://wet-boew.github.io/themes-dist/GCWeb/gcweb-theme/release/v5.0-en.html)

## Setup
- Install node.js, npm, and MongoDB
- Clone this repository: `git clone https://github.com/juleskuehn/a11y-req`
- In the created directory, run `npm install`

## Usage
- Run `mongod` to start the database server
- Run `npm run devstart` to start the node.js server
- Visit [localhost:3000](http://localhost:3000)