var hg = require('mercury')
var h = require('mercury').h
var humanTime = require('humanize-time')
var Timer = require('./timer.js')

module.exports = TodoItem


function TodoItem(opts) {
  opts = opts || {}
  var timers = hg.array((opts.timers || []).map(Timer))
  var lastTimer = hg.computed([timers], function(timers){ return timers[timers.length-1] })
  var isActive = hg.computed([lastTimer], function(lastTimer){ return lastTimer && lastTimer.isActive })
  var currentTimer = hg.computed([isActive, lastTimer], function(isActive, lastTimer){ return isActive ? lastTimer : null })
  // var completedTimers = hg.computed([timers, isActive], function(timers, isActive){ return timers.filter(function(timer){ return timer.isComplete }) })
  var timeRun = hg.computed([timers], function(timers){ return timers.reduce(function(total, timer){ return total+timer.duration }, 0) })
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
  var currentTimer = state.currentTimer()
  if (currentTimer) {
    if (currentTimer.isActive) {
      currentTimer.events.stop()
    } else {
      currentTimer.events.start()
    }
  } else {
    var timer = Timer()
    state.timers.push(timer)
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


