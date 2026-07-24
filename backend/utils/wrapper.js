async function dbTask(fn) {
  try {
    const result = await fn();
    return { data: result, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

module.exports = {
  dbTask,
};
