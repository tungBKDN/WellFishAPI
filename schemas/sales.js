const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('sales', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    item_variety_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'item_varieties',
        key: 'id'
      }
    },
    is_percentage: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    sale_off: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    expire_day: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    start_day: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    remaining: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    maximum_off: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'sales',
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
        name: "FK_sales_item_variety_id_idx",
        using: "BTREE",
        fields: [
          { name: "item_variety_id" },
        ]
      },
    ]
  });
};
