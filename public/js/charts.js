'use strict'

const SPAN_INTERVAL = 5
let myChart

const course = $('#classSelect').val()
console.log('Course:', course)

fetchData(course, (data) => {
  myChart = Highcharts.chart('mainChart', {
    title: 'Course Data',
    chart: {
      // type: 'spline'
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
          // radius: 3
        }
      }
    },
    series: [{
      data,
      name: 'Enrollment',
      step: true
    }]
  })
})

$('#classSelect').change(() => {
  const newClass = $('#classSelect').val()
  fetchData(newClass, (data) => {
    myChart.update({
      series: [{
        data,
        name: 'Enrollment'
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
  // return expandArray(data.map(item => {
  //   return {
  //     enrollment: item.enrollment,
  //     pollTime: item.pollTime
  //   }
  // }))
  return expandArray(data)
}

function expandArray (toExpand, prop = 'enrollment') {
  const newArray = []
  toExpand.forEach((item, key) => {
    // for (let i = 0; i < item.span / 5; ++i) {
    //   newArray.push(item[prop])
    // }
    // newArray.push({x: key, y: })
    newArray.push([new Date(item.pollTime).getTime(), item.enrollment])
  })
  return newArray.sort()
}
