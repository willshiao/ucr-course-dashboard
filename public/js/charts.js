'use strict'

let myChart

const courseSelector = $('#search')
const defaultCourse = 'CS111'
console.log('Course:', courseSelector.val())

fetchData(defaultCourse, (data) => {
  Highcharts.setOptions({
    global: {
      timezone: 'America/Los_Angeles'
    }
  })

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
          enabled: true
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
  const newCrn = $('#crnSelect').val()
  const name = `${newClass} (${newCrn}) enrollment`

  fetchDataByCrn(newCrn, (data) => {
    if ($('#overlay-check').is(':checked')) {
      myChart.addSeries({
        data,
        name,
        step: true
      })
    } else {
      while (myChart.series.length > 0) { // Remove all data
        myChart.series[0].remove(true)
      }
      myChart.addSeries({
        data,
        name,
        step: true
      })
    }
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
  }).bind('typeahead:idle', (ev) => {
    $('#update-btn').prop('disabled', true)
    getSections($('#search').val(), 'Lecture', (data) => {
      if (data.length > 0) $('#update-btn').prop('disabled', false)
    })
  })
})

function getSections (course, type = 'Lecture', cb) {
  $.getJSON(`/api/courses?subjectCourse=${course}&scheduleTypeDescription=${type}&distinct=courseReferenceNumber`, function (res) {
    if (res.status !== 'success') return console.error('Failed to get sections')
    const options = $('#crnSelect')
    options.html('')

    for (let i = 0; i < res.data.length; ++i) {
      options.append($('<option></option>').html(res.data[i]))
    }
    if (cb) cb(res.data)
  })
}

function fetchData (course, cb) {
  $.getJSON(`/api/courses?subjectCourse=${course}&scheduleTypeDescription=Lecture`, function (res) {
    console.log(res)
    if (res.status !== 'success') return console.error('Failed to make request')
    let data = processData(res.data)
    console.log(data)
    return cb(data)
  })
}

function fetchDataByCrn (crn, cb) {
  $.getJSON(`/api/courses?courseReferenceNumber=${crn}`, (res) => {
    if (res.status !== 'success') return console.error('Failed to get course data by CRN')
    return cb(processData(res.data))
  })
}

function processData (data) {
  const newData = data
    .map(item => [new Date(item.pollTime).getTime(), item.enrollment])
    .reverse()
  newData.push([Date.now(), newData[newData.length - 1][1]])
  return newData
}
