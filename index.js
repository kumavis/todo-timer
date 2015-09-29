var document = require('global/document')
var hg = require('mercury')
var h = require('mercury').h
var treeify = require('treeify').asTree
var humanTime = require('humanize-time')

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

function TodoItem(opts) {
  opts = opts || {}
  var timers = hg.array([])
  var lastTimer = hg.computed([timers], function(timers){ return timers[timers.length-1] })
  var isActive = hg.computed([lastTimer], function(lastTimer){ return Boolean(lastTimer && !lastTimer[1]) })
  var currentTimer = hg.computed([isActive, lastTimer], function(isActive, lastTimer){ return isActive ? lastTimer : null })
  var completedTimers = hg.computed([timers, isActive], function(timers, isActive){ return timers.filter(function(data){ return !!data[1] }) })
  var timeRun = hg.computed([completedTimers], function(completedTimers){ return completedTimers.reduce(function(total, data){ return total+(data[1]-data[0]) }, 0) })
  var humanTimeRun = hg.computed([timeRun], function(timeRun){ return humanTime(timeRun) })

  return hg.state({
    label: hg.value(opts.label || ''),
    complete: hg.value(Boolean(opts.complete)),
    timers: timers,
    currentTimer: currentTimer,
    lastTimer: lastTimer,
    isActive: isActive,
    humanTimeRun: humanTimeRun,
    channels: {
      completeTodo: completeTodo,
      toggleTimer: toggleTimer,
      setLabel: setLabel,
    },
  })
}

function setLabel(state, data) {
  state.label.set(data.value)
}

function completeTodo(state) {
  state.complete.set(!state.complete())
}

function toggleTimer(state) {
  var currentTime = new Date().getTime()
  if (state.isActive()) {
    // manual computed arrays
    var newArr = state.lastTimer()
    newArr.push(currentTime)
    state.lastTimer.set(newArr)
  } else {
    state.timers.push([currentTime])
  }
}

TodoItem.render = function(state) {
  return h('tr', [
    h('td',
      h('input', {
        type: 'checkbox',
        checked: state.complete,
        'ev-click': hg.send(state.channels.completeTodo),
      })
    ),
    h('td',
      h('button', {
        'ev-click': hg.send(state.channels.toggleTimer),
      }, state.isActive ? '❚❚' : '▶')
    ),
    h('td',
      h('input', {
        name: 'value',
        type: 'text',
        value: state.label,
        'ev-event': hg.sendChange(state.channels.setLabel),
      })
    ),
    h('td',
      h('span', state.humanTimeRun)
    ),
  ])
}

hg.app(document.body, App(), App.render)