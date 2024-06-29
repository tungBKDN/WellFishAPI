const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('orders', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    item_variety_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sales_applied_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    coin_used: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    contact_JSON: {
      type: DataTypes.JSON,
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false
    },
    costs_JSON: {
      type: DataTypes.JSON,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    item_information_JSON: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "{\\nitem_name, variety_name\\n}"
    }
  }, {
    sequelize,
    tableName: 'orders',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
