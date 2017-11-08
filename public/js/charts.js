'use strict'

let myChart

const courseSelector = $('#search')
const defaultCourse = 'CS111'
console.log('Course:', courseSelector.val())

fetchData(defaultCourse, (data) => {
  myChart = Highcharts.chart('mainChart', {
    title: {
      text: 'UCR Course Data (Winter 2017)'
    },
    subtitle: {
      text: 'Click and drag to zoom'
    },
    chart: {
      zoomType: 'x'
    },
    xAxis: {
      type: 'datetime',
      title: { text: 'Time' }
    },
    plotOptions: {
      line: {
        marker: {
          enabled: true,
          fillColor: 'black'
        }
      }
    },
    series: [{
      data,
      name: `${defaultCourse} enrollment`,
      step: true
    }]
  })
})

$('#courseForm').submit((evt) => {
  evt.preventDefault()
  const newClass = courseSelector.val()
  fetchData(newClass, (data) => {
    myChart.update({
      series: [{
        data,
        name: `${newClass} enrollment`
      }]
    })
    if (cb) cb()
  })
})

$.getJSON('/api/courses/distinct', (res) => {
  if (res.status !== 'success') return console.error('Failed to fetch course listing')
  const data = res.data

  const courses = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: data
  })
  $('#search').typeahead({
    minLength: 1,
    highlight: true
  }, {
    name: 'courses',
    source: courses
  })
})

function fetchData (course, cb) {
  $.getJSON(`/api/courses?subjectCourse=${course}&scheduleTypeDescription=Lecture`, function (reqData) {
    console.log(reqData)
    if (reqData.status !== 'success') return console.error('Failed to make request')
    let data = processData(reqData.data)
    console.log(data)
    return cb(data)
  })
}

function processData (data) {
  const newData = data
    .map(item => [new Date(item.pollTime).getTime(), item.enrollment])
    .reverse()
  newData.push([Date.now(), newData[newData.length - 1][1]])
  return newData
}
