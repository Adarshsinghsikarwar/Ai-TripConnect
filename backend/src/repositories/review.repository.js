import reviewModel from "../models/review.model.js";

class ReviewRepository {
  create(data) {
    return reviewModel.create(data);
  }
  aggregate(pipeline) {
    return reviewModel.aggregate(pipeline);
  }
}

export default new ReviewRepository();
