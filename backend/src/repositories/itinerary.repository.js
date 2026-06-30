import Itinerary from '../models/itinerary.model.js';

class ItineraryRepository {
  create(data) {
    return Itinerary.create(data);
  }

  findByTrip(tripId) {
    return Itinerary.findOne({ trip: tripId });
  }

  findByIdForUser(id, userId) {
    return Itinerary.findOne({ _id: id, user: userId });
  }
}

export default new ItineraryRepository();