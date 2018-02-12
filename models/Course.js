'use strict'

const mongoose = require('mongoose')
const {Schema} = mongoose
const MeetingsFaculty = require('./MeetingsFaculty').schema

const courseSchema = new Schema({
  id: { type: Number, index: true },
  term: { type: String, index: true },
  termDesc: String,
  courseReferenceNumber: { type: String, index: true },
  partOfTerm: String,
  courseNumber: String,
  subject: { type: String, index: true },
  subjectDescription: String,
  sequenceNumber: String,
  campusDescription: String,
  scheduleTypeDescription: String,
  courseTitle: String,
  creditHours: Number,
  maximumEnrollment: Number,
  enrollment: Number,
  seatsAvailable: Number,
  waitCapacity: Number,
  waitCount: Number,
  waitAvailable: Number,
  openSection: Boolean,
  linkIdentifier: String,
  isSectionLinked: Boolean,
  subjectCourse: { type: String, index: true },
  faculty: [{ type: Schema.Types.ObjectId, ref: 'Faculty' }],
  meetingsFaculty: [MeetingsFaculty],
  span: { type: Number, default: 5 },

  pollTime: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Course', courseSchema)
