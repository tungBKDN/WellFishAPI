var DataTypes = require("sequelize").DataTypes;
var _contacts = require("./contacts");
var _district = require("./district");
var _events = require("./events");
var _item_varieties = require("./item_varieties");
var _items = require("./items");
var _orders = require("./orders");
var _province = require("./province");
var _sales = require("./sales");
var _shipping_state = require("./shipping_state");
var _user_account = require("./user_account");
var _user_information = require("./user_information");
var _wards = require("./wards");

function initModels(sequelize) {
  var contacts = _contacts(sequelize, DataTypes);
  var district = _district(sequelize, DataTypes);
  var events = _events(sequelize, DataTypes);
  var item_varieties = _item_varieties(sequelize, DataTypes);
  var items = _items(sequelize, DataTypes);
  var orders = _orders(sequelize, DataTypes);
  var province = _province(sequelize, DataTypes);
  var sales = _sales(sequelize, DataTypes);
  var shipping_state = _shipping_state(sequelize, DataTypes);
  var user_account = _user_account(sequelize, DataTypes);
  var user_information = _user_information(sequelize, DataTypes);
  var wards = _wards(sequelize, DataTypes);

  wards.belongsTo(district, { as: "district", foreignKey: "district_id"});
  district.hasMany(wards, { as: "wards", foreignKey: "district_id"});
  sales.belongsTo(item_varieties, { as: "item_variety", foreignKey: "item_variety_id"});
  item_varieties.hasMany(sales, { as: "sales", foreignKey: "item_variety_id"});
  item_varieties.belongsTo(items, { as: "item", foreignKey: "item_id"});
  items.hasMany(item_varieties, { as: "item_varieties", foreignKey: "item_id"});
  district.belongsTo(province, { as: "province", foreignKey: "province_id"});
  province.hasMany(district, { as: "districts", foreignKey: "province_id"});

  return {
    contacts,
    district,
    events,
    item_varieties,
    items,
    orders,
    province,
    sales,
    shipping_state,
    user_account,
    user_information,
    wards,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
