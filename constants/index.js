const TODO_STATUS_ENUM = {
  completed: "Completed",
  pending: "Pending",
};

const TODO_STATUS_ARRAY = [
  TODO_STATUS_ENUM.completed,
  TODO_STATUS_ENUM.pending,
];

const EMAIL_REGEX =
  ' /^(([^<>()[]\\.,;:s@"]+(.[^<>()[]\\.,;:s@"]+)*)|(".+"))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/';

const PASSWORD_REGEX = `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/`;

module.exports = {
  TODO_STATUS_ARRAY,
  TODO_STATUS_ENUM,
  EMAIL_REGEX,
  PASSWORD_REGEX,
};
