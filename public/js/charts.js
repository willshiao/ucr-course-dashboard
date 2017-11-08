'use strict'

const SPAN_INTERVAL = 5
let myChart

const courseSelector = $('#classSelect')
console.log('Course:', courseSelector.val())

fetchData(courseSelector.val(), (data) => {
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
      name: `${courseSelector.val()} enrollment`,
      step: true
    }]
  })
})

courseSelector.change(() => {
  const newClass = courseSelector.val()
  fetchData(newClass, (data) => {
    myChart.update({
      series: [{
        data,
        name: `${newClass} enrollment`
      }]
    })
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
  return data
    .map(item => [new Date(item.pollTime).getTime(), item.enrollment])
    .reverse()
}
