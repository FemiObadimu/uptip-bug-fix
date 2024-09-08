const throwError = require("../utilities/errorHandler");
const Subscription = require("../models/Subscription");
const { parseQuery } = require("./helpers/help");

class APIFeature {
  constructor(query, queryStr = {}) {
    this.query = query;
    this.queryStr = parseQuery(queryStr);
  }

  find(queryStr) {
    const query = this.filterQuery(this.queryStr);
    if (queryStr) queryStr = parseQuery(queryStr);

    this.query = queryStr
      ? this.query.findOne(queryStr)
      : this.query.find(query);
    return this;
  }

  sort() {
    if (!this.queryStr?.sort) return this;

    const sort_by = this.queryStr.sort.split(",").join(" ");
    this.query = this.query.sort(sort_by);
    return this;
  }

  limitFields() {
    let fields = "";
    if (!this.queryStr.fields) {
      fields = `${this.getFields()}`;
    } else {
      const exclude_fields = /\-[\w]+\b/m.test(this.queryStr.fields);

      if (exclude_fields) {
        const field = this.queryStr.fields.match(/\-[\w]+\b/gm);

        fields = `${this.getFields()} ${field.join(" ")}`;
      } else {
        fields = `${fields} ${this.queryStr.fields.split(",").join(" ")}`;
      }
    }

    this.query = this.query.select(fields);
    return this;
  }

  paginate() {
    if (!this.query.page) return this;

    const page = this.query.page * 1 || 1;
    const limit = this.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(page).limit(limit);
    const page_number = Subscription.countDocuments();

    if (skip >= page_number)
      throw new throwError("no token, authorization access", 401, "INVDREQ");

    return this;
  }

  filterQuery() {
    const query = { ...this.queryStr };
    ["page", "sort", "limit", "fields"].forEach((el) => delete query[el]);
    return query;
  }

  getFields() {
    let fields = "-__v";
    if (this.query.mongooseCollection.name === "users") {
      fields = `${fields} -isAccountVerified -isEmailVerified -createdAt -updatedAt -otpToken -resetPasswordToken -password -emailResetTokenStatus`;
    }

    return fields;
  }
}

module.exports = APIFeature;
