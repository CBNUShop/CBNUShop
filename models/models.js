const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db');

// User 
const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: false
});

const Product = sequelize.define('Product', {
  product_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  product_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  percent: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0 
  }
}, {
  timestamps: false
});


// Review 
const Review = sequelize.define('Review', {
  review_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  percent: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  timestamps: false
});

// Purchase
const Purchase = sequelize.define('Purchase', {
  purchase_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  purchase_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  timestamps: false
});

User.hasMany(Review, { foreignKey: 'user_id' });
Review.belongsTo(User, { foreignKey: 'user_id' });

Product.hasMany(Review, { foreignKey: 'product_id' });
Review.belongsTo(Product, { foreignKey: 'product_id' });

User.hasMany(Purchase, { foreignKey: 'user_id' });
Purchase.belongsTo(User, { foreignKey: 'user_id' });

Product.hasMany(Purchase, { foreignKey: 'product_id' });
Purchase.belongsTo(Product, { foreignKey: 'product_id' });

sequelize.sync({ force: false }).then(() => {
  console.log('Tables have been created');
}).catch((error) => {
  console.error('Unable to create tables', error);
});

module.exports = { User, Product, Review, Purchase };
