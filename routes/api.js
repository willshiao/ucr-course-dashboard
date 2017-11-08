'use strict'

const _ = require('lodash')
const config = require('config')
const router = require('express').Router()
const Faculty = require('../models/Faculty')
const Course = require('../models/Course')
const { AsyncHandler } = require('../lib/errorHandlers')

router
  .get('/faculty', AsyncHandler(async (req, res) => {
    const searchQuery = _.pick(req.query, ['bannerId', 'courseReferenceNumber', 'emailAddress', 'term'])
    const limit = req.query.limit ? Math.min(config.get('query.facultyLimit'), req.query.limit) : config.get('query.facultyLimit')
    const faculty = await Faculty.find(searchQuery)
      .limit(limit)
      .exec()
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

    let query = Course.find(searchQuery)
      .sort('-pollTime')
      .limit(limit)
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

module.exports = router
