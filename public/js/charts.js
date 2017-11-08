'use strict'

const SPAN_INTERVAL = 5
let myChart

const courseSelector = $('#classSelect')
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
  const newData = data
    .map(item => [new Date(item.pollTime).getTime(), item.enrollment])
    .reverse()
  newData.push([Date.now(), newData[newData.length - 1][1]])
  return newData
}
