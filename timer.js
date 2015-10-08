var hg = require('mercury')
var humanTime = require('humanize-time')

module.exports = Timer


var clockAtom = hg.value((new Date()).getTime())

setInterval(function(){
  clockAtom.set((new Date()).getTime())
}, 1000)

function Timer(opts){
  opts  = opts || {}
  var start = hg.value(opts.start)
  var end = hg.value(opts.end)
  var isActive = hg.computed([start, end], function(start, end){ return start && !end })
  var isComplete = hg.computed([start, end], function(start, end){ return start && end })
  var duration = hg.computed([start, end, clockAtom], function(start, end, now){
    var startTime = start || now
    var endTime = end || now
    return endTime - startTime
  })
  var humanDuration = hg.computed([duration], function(duration){ return humanTime(duration) })
  var state = hg.state({
    start: start,
    end: end,
    isActive: isActive,
    isComplete: isComplete,
    duration: duration,
    humanDuration: humanDuration,
    channels: {
      start: startTimer,
      stop: stopTimer,
    },
    events: {
      start: function(){ startTimer.call(null, state) },
      stop: function(){ stopTimer.call(null, state) },
    },
  })
  function startTimer(state){
    state.start.set((new Date()).getTime())
  }
  function stopTimer(state){
    state.end.set((new Date()).getTime())
  }
  startTimer(state)
  return state
}