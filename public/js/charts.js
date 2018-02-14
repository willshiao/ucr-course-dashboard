'use strict'

// The code is messy
// Please don't read it (for the sake of your eyes)

let myChart

const courseSelector = $('#search')
const defaultCourse = 'CS111'
const currentTerm = '201820'
let term = currentTerm
console.log('Course:', courseSelector.val())

$('#termSelect').on('change', function (evt) {
  term = $('#termSelect').val()
  const termName = $('#termSelect option:selected').text()
  myChart.setTitle({ text: `UCR Course Data (${termName})` })
})

$.getJSON(`/api/courses?distinct=subject&term=${term}`, (res) => {
  const options = $('#subjectSelect')
  options.html('')
  res.data.sort()

  for (let i = 0; i < res.data.length; ++i) {
    options.append($('<option></option>').html(res.data[i]))
  }
})

$.getJSON(`/api/courses?distinct=courseReferenceNumber&term=${term}`, (res) => {
  // console.log(res.data)
  const courseNumbers = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: res.data
  })
  $('#crnInput').typeahead({
    minLength: 1,
    highlight: true
  }, {
    name: 'courseNumbers',
    source: courseNumbers
  })
})

fetchData(defaultCourse, 'Lecture,Seminar', (data) => {
  Highcharts.setOptions({
    global: {
      timezone: 'America/Los_Angeles'
    }
  })

  myChart = Highcharts.chart('mainChart', {
    title: {
      text: 'UCR Course Data (Spring 2018)'
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

function graphEverything (subject, type = 'Lecture') {
  $.getJSON(`/api/courses?distinct=courseReferenceNumber&subject=${subject}&scheduleTypeDescription=${type}&term=${term}`, (res) => {
    if (!$('#overlay-check').is(':checked')) clearChart()
    function getData (index) {
      if (index >= res.data.length) return null
      const crn = res.data[index]
      fetchDataByCrn(crn, (data, name) => {
        if (data.length <= 2) return 0
        myChart.addSeries({
          data,
          name: `${name} (${crn}) enrollment`,
          step: true
        })
      })
      setTimeout(() => getData(index + 1), 100)
    }
    return getData(0)
  })
}

$('#graph-all-btn').click(function () {
  graphEverything($('#subjectSelect').val(), 'Lecture,Seminar')
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
      clearChart()
      myChart.addSeries({
        data,
        name,
        step: true
      })
    }
  })
})

$('#subscribe-form').submit((evt) => {
  evt.preventDefault()
  $.post({
    url: '/api/subscribe',
    success: (res) => {
      console.log(res)
      if (res.status === 'success') {
        $('#subscribeModal').modal('hide')
        return swal('Subscribed!', 'You are now subscribed to receive notifications for the course.', 'success')
      }
      swal('Failed', res.message, 'warning')
    },
    data: $('#subscribe-form').serialize()
  })
})

$.getJSON(`/api/courses?distinct=subjectCourse&term=${term}`, (res) => {
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
    getSections($('#search').val(), '', (data) => {
      if (data.length > 0) $('#update-btn').prop('disabled', false)
    })
  })
})

function clearChart () {
  while (myChart.series.length > 0) { // Remove all data
    myChart.series[0].remove(true)
  }
}

function getSections (course, type = 'Lecture', cb) {
  $.getJSON(`/api/courses?subjectCourse=${course}&scheduleTypeDescription=${type}&distinct=courseReferenceNumber&term=${term}`, function (res) {
    if (res.status !== 'success') return console.error('Failed to get sections')
    const options = $('#crnSelect')
    options.html('')
    res.data.sort()

    for (let i = 0; i < res.data.length; ++i) {
      options.append($('<option></option>').html(res.data[i]))
    }
    if (cb) cb(res.data)
  })
}

function fetchData (course, type = 'Lecture', cb) {
  $.getJSON(`/api/courses?subjectCourse=${course}&scheduleTypeDescription=${type}&term=${term}`, function (res) {
    console.log(res)
    if (res.status !== 'success') return console.error('Failed to make request')
    let data = processData(res.data)
    // console.log(data)
    return cb(data)
  })
}

function fetchDataByCrn (crn, cb) {
  $.getJSON(`/api/courses?courseReferenceNumber=${crn}&fields=enrollment,pollTime,subjectCourse&term=${term}`, (res) => {
    if (res.status !== 'success') return console.error('Failed to get course data by CRN')
    return cb(processData(res.data), res.data[0] ? res.data[0].subjectCourse : null)
  })
}

function processData (data) {
  if (data.length === 0) return []
  let newData = data
    .map(item => [new Date(item.pollTime).getTime(), item.enrollment])
    .reverse()
  let front = -1

  for (let i = 0; i < newData.length; ++i) {
    if (newData[i][1] === 0) {
      front = i
    } else {
      break
    }
  }
  newData.push([Date.now(), newData[newData.length - 1][1]])
  return newData.slice(front + 1)
}
