const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('wards', {
    wards_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    district_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'district',
        key: 'district_id'
      }
    },
    name: {
      type: DataTypes.CHAR(64),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'wards',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "wards_id" },
        ]
      },
      {
        name: "FK_ward_to_district_idx",
        using: "BTREE",
        fields: [
          { name: "district_id" },
        ]
      },
    ]
  });
};
