var document = require('global/document')
var hg = require('mercury')
var h = require('mercury').h
var treeify = require('treeify').asTree
var humanTime = require('humanize-time')

var TodoItem = require('./todo.js')
var Timer = require('./timer.js')

function App() {
  return hg.state({
    todos: hg.array([newTodo('refactor vm')]),
    channels: {
      newTodo: addNewTodo,
    },
  })
}

function addNewTodo(state) {
  state.todos.push(newTodo())
}

App.render = function(state) {
  return h('app', [
    h('ul', state.todos.map(TodoItem.render)),
    h('button', {
      'ev-click': hg.send(state.channels.newTodo),
    }, 'new'),
    h('pre', treeify(state, true)),
  ])
}

// =================

function newTodo(label){
  return TodoItem({ label: label })
}


hg.app(document.body, App(), App.render)