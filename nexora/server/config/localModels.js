const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const filePath = path.join(__dirname, '..', 'data.json');

let data = { users: [], tasks: [] };

try {
  const stored = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data = { users: stored.users || [], tasks: stored.tasks || [] };
} catch (error) {
  data = { users: [], tasks: [] };
}

function persist() {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function newId() {
  return crypto.randomBytes(12).toString('hex');
}

function validationError(message) {
  const error = new Error(message);
  error.name = 'ValidationError';
  error.errors = { detail: { message } };
  return error;
}

function matches(record, filter) {
  return Object.entries(filter || {}).every(([key, condition]) => {
    const value = record[key];

    if (condition && typeof condition === 'object' && !(condition instanceof Date)) {
      return Object.entries(condition).every(([operator, expected]) => {
        if (operator === '$gte') return new Date(value).getTime() >= new Date(expected).getTime();
        if (operator === '$lt') return new Date(value).getTime() < new Date(expected).getTime();
        if (operator === '$ne') return value !== expected;
        return false;
      });
    }

    if (condition instanceof Date) {
      return value instanceof Date && value.getTime() === condition.getTime();
    }

    return String(value) === String(condition);
  });
}

function pick(record, fields) {
  const output = { _id: record._id };
  String(fields)
    .split(/\s+/)
    .filter(Boolean)
    .forEach((field) => {
      if (field !== '-_id') output[field] = record[field];
    });
  return output;
}

class SingleQuery {
  constructor(value) {
    this.value = value;
  }

  then(resolve, reject) {
    return Promise.resolve(this.value).then(resolve, reject);
  }

  select(fields) {
    if (!this.value) return null;
    const selection = String(fields);
    if (selection.startsWith('-')) {
      const doc = { ...this.value };
      selection
        .slice(1)
        .split(/\s+/)
        .filter(Boolean)
        .forEach((field) => delete doc[field]);
      return doc;
    }
    return pick(this.value, selection);
  }
}

class Query {
  constructor(getRecords) {
    this.getRecords = getRecords;
    this.sortSpec = null;
    this.limitCount = null;
    this.selectFields = null;
  }

  then(resolve, reject) {
    return Promise.resolve(this.result()).then(resolve, reject);
  }

  sort(spec) {
    this.sortSpec = spec;
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  select(fields) {
    this.selectFields = fields;
    return this;
  }

  result() {
    let records = this.getRecords();

    if (this.sortSpec) {
      const [[key, direction]] = Object.entries(this.sortSpec);
      records = [...records].sort((a, b) => {
        const aValue = a[key] instanceof Date ? a[key].getTime() : a[key];
        const bValue = b[key] instanceof Date ? b[key].getTime() : b[key];
        if (aValue === bValue) return 0;
        return direction === -1 || direction === 'desc'
          ? aValue > bValue
            ? -1
            : 1
          : aValue > bValue
            ? 1
            : -1;
      });
    }

    if (this.limitCount != null) {
      records = records.slice(0, this.limitCount);
    }

    if (this.selectFields) {
      records = records.map((record) => pick(record, this.selectFields));
    }

    return records;
  }
}

function hydrateUser(record) {
  return {
    ...record,
    _id: String(record._id),
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
  };
}

function serializeUser(record) {
  return {
    _id: String(record._id),
    name: String(record.name || '').trim(),
    email: String(record.email || '').trim().toLowerCase(),
    passwordHash: record.passwordHash,
    createdAt: record.createdAt || new Date(),
    updatedAt: new Date(),
  };
}

function validateUser(record) {
  const name = String(record.name || '').trim();
  if (name.length < 2 || name.length > 60) {
    throw validationError('Name must be between 2 and 60 characters');
  }
  if (!/^\S+@\S+\.\S+$/.test(String(record.email || '').trim())) {
    throw validationError('Please enter a valid email address');
  }
  if (!record.passwordHash) {
    throw validationError('Password hash is required');
  }
}

function userDoc(record) {
  const doc = hydrateUser(record);
  doc.save = async () => {
    validateUser(doc);
    const index = data.users.findIndex((item) => String(item._id) === String(doc._id));
    if (index < 0) return doc;
    data.users[index] = serializeUser({ ...data.users[index], name: doc.name, email: doc.email });
    persist();
    return userDoc(data.users[index]);
  };
  return doc;
}

const User = {
  findOne(filter) {
    const record = data.users.find((item) => matches(hydrateUser(item), filter));
    return new SingleQuery(record ? userDoc(record) : null);
  },

  findById(id) {
    const record = data.users.find((item) => String(item._id) === String(id));
    return new SingleQuery(record ? userDoc(record) : null);
  },

  create(payload) {
    const record = serializeUser({ ...payload, _id: newId(), createdAt: new Date() });
    validateUser(record);
    if (data.users.some((item) => item.email === record.email)) {
      throw validationError('An account with this email already exists');
    }
    data.users.push(record);
    persist();
    return userDoc(record);
  },
};

function hydrateTask(record) {
  return {
    ...record,
    _id: String(record._id),
    userId: String(record.userId),
    dueDate: record.dueDate ? new Date(record.dueDate) : null,
    completedAt: record.completedAt ? new Date(record.completedAt) : null,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
  };
}

function serializeTask(record) {
  return {
    _id: String(record._id),
    userId: String(record.userId),
    title: String(record.title || '').trim(),
    description: String(record.description || '').trim(),
    priority: record.priority || 'medium',
    category: record.category || 'personal',
    dueDate: record.dueDate || null,
    isCompleted: Boolean(record.isCompleted),
    completedAt: record.completedAt || null,
    createdAt: record.createdAt || new Date(),
    updatedAt: new Date(),
  };
}

function validateTask(record) {
  const title = String(record.title || '').trim();
  if (!title || title.length > 200) {
    throw validationError('Title is required and cannot exceed 200 characters');
  }
  if (String(record.description || '').length > 1000) {
    throw validationError('Description cannot exceed 1000 characters');
  }
  if (!['low', 'medium', 'high'].includes(record.priority)) {
    throw validationError('Invalid priority');
  }
  if (!['personal', 'study', 'work'].includes(record.category)) {
    throw validationError('Invalid category');
  }
}

function taskDoc(record) {
  const doc = hydrateTask(record);
  doc.save = async () => {
    validateTask(doc);
    const index = data.tasks.findIndex((item) => String(item._id) === String(doc._id));
    if (index < 0) return doc;
    data.tasks[index] = serializeTask(doc);
    persist();
    return taskDoc(data.tasks[index]);
  };
  return doc;
}

function findTaskRecord(filter) {
  return data.tasks.find((item) => matches(hydrateTask(item), filter));
}

const Task = {
  find(filter) {
    return new Query(() =>
      data.tasks.filter((item) => matches(hydrateTask(item), filter)).map((item) => taskDoc(item))
    );
  },

  findOne(filter) {
    const record = findTaskRecord(filter);
    return new SingleQuery(record ? taskDoc(record) : null);
  },

  countDocuments(filter) {
    return Promise.resolve(
      data.tasks.filter((item) => matches(hydrateTask(item), filter)).length
    );
  },

  create(payload) {
    const record = serializeTask({ ...payload, _id: newId(), createdAt: new Date() });
    validateTask(record);
    data.tasks.push(record);
    persist();
    return taskDoc(record);
  },

  async findOneAndDelete(filter) {
    const index = data.tasks.findIndex((item) => matches(hydrateTask(item), filter));
    if (index < 0) return null;
    const [record] = data.tasks.splice(index, 1);
    persist();
    return taskDoc(record);
  },
};

module.exports = { User, Task, persist, filePath };
