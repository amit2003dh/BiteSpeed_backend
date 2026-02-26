const { DataTypes } = require('sequelize');
const sequelize = process.env.NODE_ENV === 'production' 
  ? require('../config/database') 
  : require('../config/database-sqlite');

const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'phone_number'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  linkedId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'linked_id',
    references: {
      model: 'contacts',
      key: 'id'
    }
  },
  linkPrecedence: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'primary',
    field: 'link_precedence',
    validate: {
      isIn: [['primary', 'secondary']]
    }
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'deleted_at'
  }
}, {
  tableName: 'contacts',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['email', 'phone_number'],
      where: {
        deleted_at: null
      }
    },
    {
      fields: ['email']
    },
    {
      fields: ['phone_number']
    },
    {
      fields: ['linked_id']
    },
    {
      fields: ['link_precedence']
    }
  ]
});

module.exports = Contact;
