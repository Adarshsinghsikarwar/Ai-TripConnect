import itinerary from "../models/itinerary.model";

class ItineraryRepository {
  create(data) {
    return itinerary.create(data);
  }
  findByTrip(tripId) {
    return Itinerary.findOne({ trip: tripId });
  }

  findByIdForUser(id, userId) {
    return itinerary.findOne({ _id: id, user: userId });
  }
}

export default new ItineraryRepository();
