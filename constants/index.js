const TODO_STATUS_ENUM = {
  completed: "Completed",
  pending: "Pending",
  ongoing: "Ongoing",
};

const TODO_STATUS_ARRAY = [
  TODO_STATUS_ENUM.completed,
  TODO_STATUS_ENUM.pending,
  TODO_STATUS_ENUM.ongoing,
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/;

module.exports = {
  TODO_STATUS_ARRAY,
  TODO_STATUS_ENUM,
  EMAIL_REGEX,
  PASSWORD_REGEX,
};
