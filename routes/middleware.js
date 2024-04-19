exports.send405Response = (res, allowed) => {
  res.set("Allow", allowed.join(", "));
  res.status(405).send();
};
