'use strict'

const _ = require('lodash')
const config = require('config')
const validator = require('validator')
const bodyParser = require('body-parser')
const router = require('express').Router()
const Faculty = require('../models/Faculty')
const Subscription = require('../models/Subscription')
const Course = require('../models/Course')
const logger = require('../lib/logger')
const { AsyncHandler } = require('../lib/errorHandlers')

router.use(bodyParser.urlencoded({ extended: false }))

router.get('/test', (req, res) => {
  res.send('OK')
})

router
  .get('/faculty', AsyncHandler(async (req, res) => {
    const searchQuery = _.pick(req.query, ['bannerId', 'courseReferenceNumber', 'emailAddress', 'term'])
    const limit = req.query.limit ? Math.min(config.get('query.facultyLimit'), req.query.limit) : config.get('query.facultyLimit')
    const fields = req.query.fields ? req.query.fields.split(',') : {}

    const query = Faculty.find(searchQuery, fields)
    if (req.query.distinct) {
      query.distinct(req.query.distinct)
    } else {
      query.limit(limit)
    }

    const faculty = await query.exec()
    res.successJson(faculty)
  }))
  .get('/faculty/:id', AsyncHandler(async (req, res) => {
    if (!req.params || !req.params.id) return res.failMsg('Invalid ID')
    const faculty = await Faculty.findById(req.params.id)
    if (!faculty) return res.failMsg('Faculty with ID not found')
    res.successJson(faculty)
  }))

router
  .get('/courses', AsyncHandler(async (req, res) => {
    const searchQuery = _.pick(req.query, ['subject', 'subjectCourse', 'courseReferenceNumber', 'id', 'scheduleTypeDescription'])
    const limit = req.query.limit ? Math.min(config.get('query.courseLimit'), req.query.limit) : config.get('query.courseLimit')
    const fields = req.query.fields ? req.query.fields.split(',') : {}

    let query = Course.find(searchQuery, fields)

    if (req.query.distinct) {
      query.distinct(req.query.distinct)
    } else {
      query.limit(limit).sort('-pollTime')
    }
    if (req.query.populate) query.populate('faculty')

    const courses = await query.exec()
    res.successJson(courses)
  }))

  .get('/courses/distinct', AsyncHandler(async (req, res) => {
    const data = await Course.collection.distinct('subjectCourse')
    res.successJson(data)
  }))

  .get('/courses/subjects', AsyncHandler(async (req, res) => {
    const data = await Course.collection.distinct('subject')
    res.successJson(data)
  }))

  .get('/courses/times', AsyncHandler(async (req, res) => {
    if (!req.query.term) return res.failMsg('Missing term field')

    const filter = { subject: 'CS' }

    if (req.query.courses) filter.subjectCourse = { $in: req.query.courses.split(',') }

    Course.collection.aggregate([
      { $match: {term: req.query.term} },
      { $match: filter },
      { $sort: { pollTime: -1 } },
      {
        $group: {
          _id: '$courseReferenceNumber',
          subjectCourse: { $first: '$subjectCourse' },
          count: {'$sum': 1},
          scheduleType: { $first: '$scheduleTypeDescription' },
          location: {
            $last: { $arrayElemAt: ['$meetingsFaculty', 0] }
          }
        }
      }
    ], (err, data) => {
      if (err) logger.error('Error aggregating data: ', err)
      res.successJson(data)
    })
  }))

router
  .post('/subscribe', AsyncHandler(async (req, res) => {
    if (!req.body) return res.failMsg('Invalid form submission')
    if (!req.body.name || !req.body.email || !req.body.crn) return res.failMsg('Missing form fields')
    if (!validator.isEmail(req.body.email)) return res.failMsg('Invalid email address')
    // Check if CRN is valid
    const course = await Course.findOne({ courseReferenceNumber: req.body.crn }, { seatsAvailable: 1 })
      .sort({ pollTime: -1 })
      .lean()
      .exec()
    if (!course) return res.failMsg(`No course found with CRN: ${req.body.crn}`)
    if (course.seatsAvailable > 0) return res.failMsg(`Course is not full: ${course.seatsAvailable} seats are still available`)

    const subCount = await Subscription.count({
      email: req.body.email,
      crn: req.body.crn,
      enabled: true
    })
    if (subCount > 0) return res.failMsg('This email is already subscribed to this course')

    const sub = new Subscription(req.body)
    await sub.save()
    return res.successJson()
  }))

module.exports = router
