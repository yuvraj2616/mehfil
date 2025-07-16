const Event = require("../models/Event");

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'published' })
      .populate('organizer', 'name email role')
      .populate('artists.artist', 'name artistProfile')
      .sort({ 'dateTime.start': 1 });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single event
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email role')
      .populate('artists.artist', 'name artistProfile');
    
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new event
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, category, maxAttendees } = req.body;
    
    const event = await Event.create({
      title,
      description,
      date,
      time,
      location,
      category,
      maxAttendees,
      organizer: req.user._id
    });
    
    await event.populate('organizer', 'name email role');
    
    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    // Check if user is the organizer or admin
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Not authorized to update this event" });
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('organizer', 'name email role');
    
    res.json({ message: "Event updated successfully", event: updatedEvent });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    // Check if user is the organizer or admin
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Not authorized to delete this event" });
    }
    
    await Event.findByIdAndUpdate(req.params.id, { isActive: false });
    
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Join event
exports.joinEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    if (event.attendees.includes(req.user._id)) {
      return res.status(400).json({ error: "Already registered for this event" });
    }
    
    if (event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({ error: "Event is full" });
    }
    
    event.attendees.push(req.user._id);
    await event.save();
    
    res.json({ message: "Successfully joined the event" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Leave event
exports.leaveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    if (!event.attendees.includes(req.user._id)) {
      return res.status(400).json({ error: "Not registered for this event" });
    }
    
    event.attendees = event.attendees.filter(
      attendee => attendee.toString() !== req.user._id.toString()
    );
    await event.save();
    
    res.json({ message: "Successfully left the event" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
