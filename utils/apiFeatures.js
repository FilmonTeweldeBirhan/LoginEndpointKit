class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    const queryObj = { ...this.queryStr };
    // Delete the excluded
    const excludedFields = ["limit", "fields", "page", "sort", "search"];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|lt|gte|lte)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-product_dateCreated");
    }

    return this;
  }

  limitFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  pagination() {
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 100;

    const skip = (page - 1) * limit;

    // Skip and limit pages depending on the skip and limit vars
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  search() {
    // {$or: [{product_title: {$regex: 'Dougnut'}}, {product_description: {$regex: "bombolino"}}]}
    if (this.queryStr.search) {
      const product_title = { product_title: { $regex: this.queryStr.search } };
      const product_tags = { product_tags: { $regex: this.queryStr.search } };
      this.query = this.query.find({ $or: [product_title, post_tags] });
    } else {
      this.query = this.query.find();
    }

    return this;
  }
}

module.exports = APIFeatures;
