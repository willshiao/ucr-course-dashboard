'use strict'

const term = '201820'
let cal

// function getDays() {
//   let start = moment().sub(15, 'd')
//   let end = moment().add(15, 'd')

//   const arr = []
//   while(start.isBefore(end)) {
//     start.add(1, 'd')
//   }
// }

function momentFromTime (time, day) {
  const date = moment()
    .day(day)
    .hour(parseInt(time.slice(0, 2), 10))
    .minute(parseInt(time.slice(2), 10))
    .second(0)
    .millisecond(0)
  console.log('Date:', date.toString())
  return date
}

// Function to process data returned from API
function processData (data) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  console.log('Got data:', data)
  const output = []

  data.forEach(item => {
    const loc = item.location
    const mt = loc.meetingTime
    if (!loc || !mt) return false

    days.forEach(day => {
      if (!mt[day]) return false
      output.push({
        id: loc.courseReferenceNumber,
        title: `${item.subjectCourse} (${item.scheduleType}) [${loc.courseReferenceNumber}]`,
        start: momentFromTime(mt.beginTime, day),
        template: momentFromTime(mt.endTime, day)
      })
    })
  })
  return output
}

function queryApi (cb) {
  const courses = $('#courses').val()
  const courseType = $('#courseType').val()
  $.getJSON(`/api/courses/times?courses=${courses}&scheduleType=${courseType}&term=${term}`, (res) => {
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
        right: 'month,agendaWeek,agendaDay'
      },
      weekends: false,
      events
    })
  })

  $('#courseForm').submit((evt) => {
    evt.preventDefault()
    queryApi(events => {
      console.log('Running re-render')
      // $('#calendar').fullCalendar('updateEvents', events)
      // $('#calendar').fullCalendar('rerenderEvents')
    })
  })
})
