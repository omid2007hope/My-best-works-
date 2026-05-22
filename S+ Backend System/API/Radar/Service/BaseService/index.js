class BaseService {
  simplePost = async (data) => {
    if (!this.model) {
      return data;
    }

    const payloads = Array.isArray(data) ? data : [data];

    try {
      if (Array.isArray(data)) {
        return Promise.all(
          payloads.map((payload) => new this.model(payload).save()),
        );
      }

      return new this.model(payloads[0]).save();
    } catch (error) {
      console.error(error);
      throw new Error("Post was unsuccessful");
    }
  };
}

simplePatch = async (data, id, isNew = true) => {
  const checkArray = Array.isArray(data) ? data : [data];
  const safeData = checkArray;

  try {
    return await this.model.findOneAndUpdate(id, safeData, {
      returnDocument: isNew ? "After" : "Before",
    });
  } catch (error) {
    console.error(error);
    throw (error, "Path was unsucssesfull");
  }
};

simpleGet = async () => {
  try {
    return this.model.find();
  } catch (error) {
    console.error(error);
    throw (error, "Could not get any data");
  }
};

module.exports = BaseService;
