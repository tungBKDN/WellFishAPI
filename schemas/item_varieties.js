const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('item_varieties', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      references: {
        model: 'items',
        key: 'id'
      }
    },
    variety_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "Empty"
    },
    unit: {
      type: DataTypes.STRING(128),
      allowNull: false,
      defaultValue: "not_set"
    },
    price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    },
    stock_remaining: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    image_source: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'item_varieties',
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
      {
        name: "FK_items_idx",
        using: "BTREE",
        fields: [
          { name: "item_id" },
        ]
      },
    ]
  });
};
