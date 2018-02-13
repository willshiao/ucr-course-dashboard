'use strict'

// Yes, I know the code is messy
// Please don't read it (for the sake of your eyes)

const TERM = '201820'
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
const COLORS = [
  '#F44336', '#B71C1C', '#D50000',  // Reds
  '#E91E63', '#880E4F', '#C51162',  // Pinks
  '#9C27B0', '#4A148C', '#AA00FF',  // Purples
  '#2196F3', '#0D47A1', '#2962FF',  // Blues
  '#4CAF50', '#1B5E20', '#00C853',  // Greens
  '#FFEB3B', '#F57F17', '#FFD600'   // Yellows
]

function momentFromTime (time, day) {
  const date = moment()
    .day(day)
    .hour(parseInt(time.slice(0, 2), 10))
    .minute(parseInt(time.slice(2), 10))
    .second(0)
    .millisecond(0)
  return date
}

// Function to process data returned from API
function processData (data) {
  let colorIndex = 0
  const output = []
  const makeTransparent = $('#transparent').is(':checked')

  data.forEach(item => {
    const loc = item.location
    if (!loc || !loc.meetingTime) return false

    DAYS.forEach(day => {
      if (!loc.meetingTime[day]) return false
      const event = {
        id: loc.courseReferenceNumber,
        title: `${item.subjectCourse} (${item.scheduleType}) [${loc.courseReferenceNumber}]`,
        start: momentFromTime(loc.meetingTime.beginTime, day),
        template: momentFromTime(loc.meetingTime.endTime, day),
        backgroundColor: COLORS[colorIndex]
      }
      if (makeTransparent) {
        event.backgroundColor = 'rgba(46,125,50,0.3)'
        delete event.title
        event.overlap = true
        event.className = 'customEvent'
      }
      output.push(event)
    })
    colorIndex = (colorIndex + 1) % COLORS.length
  })
  return output
}

function queryApi (cb) {
  const courses = $('#courses').val()
    .split(',')
    .map(s => s.trim())
    .join(',')
  const courseType = $('#courseType').val()
  const subject = $('#subject').val()

  $.getJSON(`/api/courses/times?courses=${courses}&scheduleType=${courseType}&term=${TERM}&subject=${subject}`, (res) => {
    if (res.status !== 'success') return console.error('Failed to get matching courses:', res)
    const data = processData(res.data)
    console.log(data)
    cb(data)
  })
}

$(function () {
  queryApi(events => {
    // Get data
    $('#calendar').fullCalendar({
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'agendaWeek,agendaDay'
      },
      defaultView: 'agendaWeek',
      weekends: false,
      minTime: '7:00',
      maxTime: '24:00',
      events
    })
  })
  let pending = false

  $('#courseForm').submit((evt) => {
    evt.preventDefault()
    if (pending) return false
    // $('#courses').prop('disabled', true)
    pending = true

    queryApi(events => {
      $('#calendar').fullCalendar('removeEvents')
      $('#calendar').fullCalendar('renderEvents', events)
      pending = false
      // $('#courses').prop('disabled', false)
    })
  })
})
