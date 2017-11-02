'use strict'

const mongoose = require('mongoose')
const {Schema} = mongoose
const findOrCreate = require('mongoose-findorcreate')

const facultySchema = new Schema({
  bannerId: { type: String, index: true },
  category: Schema.Types.Mixed,
  class: String,
  courseReferenceNumber: { type: String, index: true },
  displayName: String,
  emailAddress: String,
  primaryIndicator: Boolean,
  term: { type: String, index: true }
})

facultySchema.plugin(findOrCreate)

module.exports = mongoose.model('Faculty', facultySchema)
