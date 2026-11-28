const useLocalStore = process.env.NEXORA_LOCAL_STORE === 'true';

const models = useLocalStore
  ? require('./localModels')
  : {
      User: require('../models/User'),
      Task: require('../models/Task'),
    };

module.exports = models;
