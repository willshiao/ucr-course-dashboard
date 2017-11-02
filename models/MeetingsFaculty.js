'use strict'

const mongoose = require('mongoose')
const {Schema} = mongoose

const meetingsFacultySchema = new Schema({
  category: String,
  class: String,
  courseReferenceNumber: String,
  meetingTime: {
    beginTime: String,
    building: String,
    buildingDescription: String,
    campus: String,
    campusDescription: String,
    category: String,
    class: String,
    courseReferenceNumber: String,
    creditHourSession: Number,
    endDate: String,
    endTime: String,
    friday: Boolean,
    hoursWeek: Number,
    meetingScheduleType: String,
    monday: Boolean,
    room: Schema.Types.Mixed,
    saturday: Boolean,
    startDate: String,
    sunday: Boolean,
    term: String,
    thursday: Boolean,
    tuesday: Boolean,
    wednesday: Boolean
  },
  term: String
})

module.exports = mongoose.model('MeetingsFaculty', meetingsFacultySchema)
